import type { Metadata } from 'next';
import Link from 'next/link';

// Configure your public contact email here or via NEXT_PUBLIC_SUPPORT_EMAIL
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'aziz.belkhir.aziz@gmail.com';
const LAST_UPDATED = '2025-11-02';

export const metadata: Metadata = {
  title: 'Gifty — Account and Data Deletion',
  description:
    'How to request account deletion or data deletion for the Gifty app, including what data are deleted, what may be retained, and retention timelines. (EN/FR)',
  robots: { index: true, follow: true },
};

export default function DataDeletionPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Account or data deletion request')}`;
  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Gifty — Account and Data Deletion</h1>
        <p className="mt-1 text-sm text-slate-500">Developer: Belkhir Aziz · Last updated: {LAST_UPDATED}</p>
      </header>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">EN — How to request deletion</h2>
        <p className="mt-2 text-slate-700">We offer two options so you can control your data:</p>

        <h3 className="mt-4 font-medium">1) Delete account (full deletion)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Open the app → Friends.</li>
          <li>Tap the <em>Personal details</em> icon in the top‑right.</li>
          <li>Select <em>Delete Account</em> and confirm.</li>
        </ul>
        <p className="mt-2 text-slate-700"><strong>What happens:</strong></p>
        <ul className="ml-6 list-disc text-slate-700">
          <li>Your application account (<code className="rounded bg-slate-100 px-1">users</code> record) is deleted.</li>
          <li>Your events, reactions (likes, dislikes, wishlist/superLikes, reservations), and relations are deleted.</li>
          <li>You are signed out. You will need to create a new account to use the app again.</li>
          <li>Note: Your authentication identity with the sign‑in provider may not be removed automatically. If you want your auth identity deleted as well, contact us (see Contact).</li>
        </ul>

        <h3 className="mt-5 font-medium">2) Delete data only (keep account)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Open the app → Friends.</li>
          <li>Tap the <em>Personal details</em> icon in the top‑right.</li>
          <li>Select <em>Delete Data</em> and confirm.</li>
        </ul>
        <p className="mt-2 text-slate-700"><strong>What happens:</strong></p>
        <ul className="ml-6 list-disc text-slate-700">
          <li>Your events are deleted.</li>
          <li>Your reactions are deleted (likes, dislikes, wishlist/superLikes, reservations).</li>
          <li>Your relations (connections) are deleted.</li>
          <li>Your app account and basic profile remain (e.g., name, email, gender, country, date of birth). You can continue using the app and rebuild your data.</li>
        </ul>

        <h3 className="mt-5 font-medium">What data are deleted</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Events you created</li>
          <li>Reactions you made (including wishlist/superLikes and reservations)</li>
          <li>Relations (connections with other users)</li>
          <li>Some local preferences on your device (e.g., Gift Discovery view preferences)</li>
        </ul>

        <h3 className="mt-5 font-medium">What data may be retained</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Your account and basic profile (only when you choose “Delete Data”)</li>
          <li>Limited server logs and technical backups retained for up to 30 days for fraud prevention, debugging, and legal compliance</li>
          <li>Authentication identity with your sign‑in provider may persist unless you specifically request its deletion via support</li>
        </ul>

        <h3 className="mt-5 font-medium">Retention and timelines</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>In‑app deletions of application data occur immediately.</li>
          <li>Residual backups and server logs, where applicable, are purged within 30 days.</li>
        </ul>

        <h3 className="mt-5 font-medium">Contact</h3>
        <p className="mt-2 text-slate-700">
          If you have any questions, or if you want your authentication identity removed, contact:{' '}
          <a className="text-blue-600 underline hover:no-underline" href={mailto}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">FR — Procédure de suppression</h2>
        <p className="mt-2 text-slate-700">Nous proposons deux options dans l’application afin de vous laisser le contrôle :</p>

        <h3 className="mt-4 font-medium">1) Supprimer le compte (suppression complète)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Ouvrez l’app → Amis.</li>
          <li>Touchez l’icône <em>Détails personnels</em> en haut à droite.</li>
          <li>Choisissez <em>Supprimer le compte</em> et confirmez.</li>
        </ul>
        <p className="mt-2 text-slate-700"><strong>Ce qui se passe :</strong></p>
        <ul className="ml-6 list-disc text-slate-700">
          <li>Votre compte applicatif (enregistrement <code className="rounded bg-slate-100 px-1">users</code>) est supprimé.</li>
          <li>Vos événements, réactions (j’aime, je n’aime pas, liste de souhaits/superLikes, réservations) et relations sont supprimés.</li>
          <li>Vous êtes déconnecté(e). Vous devrez créer un nouveau compte pour réutiliser l’app.</li>
          <li>Remarque : votre identité d’authentification auprès du fournisseur de connexion peut ne pas être supprimée automatiquement. Pour demander sa suppression, contactez‑nous (voir Contact).</li>
        </ul>

        <h3 className="mt-5 font-medium">2) Supprimer les données uniquement (conserver le compte)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Ouvrez l’app → Amis.</li>
          <li>Touchez l’icône <em>Détails personnels</em> en haut à droite.</li>
          <li>Choisissez <em>Supprimer les données</em> et confirmez.</li>
        </ul>
        <p className="mt-2 text-slate-700"><strong>Ce qui se passe :</strong></p>
        <ul className="ml-6 list-disc text-slate-700">
          <li>Vos événements sont supprimés.</li>
          <li>Vos réactions sont supprimées (j’aime, je n’aime pas, liste de souhaits/superLikes, réservations).</li>
          <li>Vos relations (connexions) sont supprimées.</li>
          <li>Votre compte et votre profil de base restent (nom, e‑mail, genre, pays, date de naissance). Vous pouvez continuer d’utiliser l’app et reconstruire vos données.</li>
        </ul>

        <h3 className="mt-5 font-medium">Données supprimées</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Événements créés</li>
          <li>Réactions effectuées (y compris liste de souhaits/superLikes et réservations)</li>
          <li>Relations (connexions entre utilisateurs)</li>
          <li>Certaines préférences locales sur votre appareil (p. ex. préférences d’affichage de la Découverte de cadeaux)</li>
        </ul>

        <h3 className="mt-5 font-medium">Données conservées</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Votre compte et votre profil de base (uniquement si vous choisissez « Supprimer les données »)</li>
          <li>Journaux serveur et sauvegardes techniques conservés jusqu’à 30 jours (prévention de fraude, débogage, conformité légale)</li>
          <li>L’identité d’authentification auprès de votre fournisseur de connexion peut persister, sauf demande explicite de suppression via le support</li>
        </ul>

        <h3 className="mt-5 font-medium">Délais de rétention</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>La suppression des données applicatives via l’app est immédiate.</li>
          <li>Les sauvegardes résiduelles et journaux serveur, le cas échéant, sont purgés sous 30 jours.</li>
        </ul>

        <h3 className="mt-5 font-medium">Contact</h3>
        <p className="mt-2 text-slate-700">
          Pour toute question ou pour demander la suppression de votre identité d’authentification :{' '}
          <a className="text-blue-600 underline hover:no-underline" href={mailto}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>

      <div className="mt-8 text-sm text-slate-500">
        <p>
          Looking for our home page?{' '}
          <Link className="text-blue-600 underline hover:no-underline" href="/">Return to Gifty</Link>.
        </p>
      </div>
    </div>
  );
}
