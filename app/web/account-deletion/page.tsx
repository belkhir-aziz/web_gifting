import { redirect } from 'next/navigation';

export default function Page() {
  // Canonicalize to /web/data-deletion
  redirect('/web/data-deletion');
}
