import AuthGuard from '../../components/auth/AuthGuard';

// Everything under (creator) is host-only. Guard once here instead of
// per page, so guests/eventees never see the dashboard shell.
export default function CreatorLayout({ children }) {
  return <AuthGuard role="CREATOR">{children}</AuthGuard>;
}
