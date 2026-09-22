import { NextResponse } from 'next/server';
import { forwardedCookies, normalizedProxyPath, upstreamSetCookies } from '../../../../lib/auth-proxy.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPSTREAM = (process.env.LARAVEL_UPSTREAM_URL || 'https://mosaiq.axtrics.com').replace(/\/$/, '');
const SESSION_COOKIE = process.env.LARAVEL_SESSION_COOKIE_NAME || 'mosaiq-session';
const STATEFUL_ORIGIN = (process.env.LARAVEL_STATEFUL_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

async function proxy(request, { params }) {
  let path;
  try {
    path = normalizedProxyPath(params.path);
  } catch {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = `${UPSTREAM}/${path}${requestUrl.search}`;
  const headers = new Headers({
    Accept: request.headers.get('accept') || 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Origin: STATEFUL_ORIGIN,
    Referer: `${STATEFUL_ORIGIN}/`,
  });
  const contentType = request.headers.get('content-type');
  const csrfToken = request.headers.get('x-xsrf-token');
  const cookies = forwardedCookies(request.headers.get('cookie') || '', SESSION_COOKIE);
  if (contentType) headers.set('Content-Type', contentType);
  if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken);
  if (cookies) headers.set('Cookie', cookies);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json({ message: 'Unable to reach the authentication server.' }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of ['content-type', 'content-disposition', 'x-request-id', 'retry-after']) {
    const value = upstreamResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  for (const cookie of upstreamSetCookies(upstreamResponse.headers)) responseHeaders.append('Set-Cookie', cookie);

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
