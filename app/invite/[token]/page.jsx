import InvitationPage from '../../InvitationPage';

export default function InvitationRoute({ params }) {
  return <InvitationPage token={params.token} />;
}
