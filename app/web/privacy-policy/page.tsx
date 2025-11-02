import type { Metadata } from 'next';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'aziz.belkhir.aziz@gmail.com';
const LAST_UPDATED = '2025-11-02';

export const metadata: Metadata = {
  title: 'Gifting — Privacy Policy',
  description:
    'Privacy Policy for the Gifting app: what data we collect, how we use it, legal bases, retention periods, your rights (access, deletion), and contact info. (EN/FR) ',
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <header className="mb-6">
  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Gifting — Privacy Policy</h1>
        <p className="mt-1 text-sm text-slate-500">Developer: Belkhir Aziz · Last updated: {LAST_UPDATED}</p>
      </header>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">EN — Overview</h2>
        <p className="mt-2 text-slate-700">
          Gifting helps you discover gifts and manage wish ideas with friends. This policy explains what data we collect, how we use it, how long we keep it, and
          the choices you have.
        </p>

        <h3 className="mt-5 font-medium">Data we process</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>
            Account and profile: name, email, country, gender, date of birth (where provided), basic preferences.
          </li>
          <li>
            App content: events you create, your reactions (likes, dislikes, wishlist/superLikes, reservations), relations (friends/connections), tags (occasions, relationships, age ranges) you apply.
          </li>
          <li>
            Usage and device data: basic diagnostics and logs for reliability and security (IP, timestamps, error logs).
          </li>
        </ul>

        <h3 className="mt-5 font-medium">How we use data</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Provide and improve app features like Gift Discovery, wishlists, and reservations.</li>
          <li>Maintain account security, prevent abuse, and debug issues.</li>
          <li>Comply with legal obligations and enforce terms.</li>
        </ul>

        <h3 className="mt-5 font-medium">Legal bases (where applicable)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Contract: to deliver core app functionality you request.</li>
          <li>Legitimate interests: keep the service secure and reliable.</li>
          <li>Consent: where required (e.g., certain notifications or optional analytics if added in the future).</li>
        </ul>

        <h3 className="mt-5 font-medium">Sharing</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Service providers: we use Supabase (hosting and database) and similar infrastructure providers.</li>
          <li>No sale of personal data. We do not share your personal data with third parties for their own marketing.</li>
          <li>Legal and safety: we may disclose information to comply with law or protect users and the service.</li>
        </ul>

        <h3 className="mt-5 font-medium">Retention</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Application data you delete in-app is removed immediately from the active database.</li>
          <li>Backups and server logs are typically retained up to 30 days, then purged.</li>
        </ul>

        <h3 className="mt-5 font-medium">Your choices and rights</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>
            In-app controls: you can delete your account (full deletion) or delete app data while keeping the account. See{' '}
            <a className="text-blue-600 underline hover:no-underline" href="/web/data-deletion">Account & Data Deletion</a>.
          </li>
          <li>Access/update: you may view and update certain profile information within the app.</li>
          <li>Contact us to exercise additional rights (access, deletion, portability) as applicable by your jurisdiction.</li>
        </ul>

        <h3 className="mt-5 font-medium">Children</h3>
  <p className="mt-2 text-slate-700">Gifting is not intended for children under the age required by local law to consent to data processing without parental approval.</p>

        <h3 className="mt-5 font-medium">International transfers</h3>
        <p className="mt-2 text-slate-700">
          Data may be processed and stored in the region of our infrastructure providers. We take reasonable measures to protect your data in transit and at rest.
        </p>

        <h3 className="mt-5 font-medium">Contact</h3>
        <p className="mt-2 text-slate-700">
          Questions or requests? Email <a className="text-blue-600 underline hover:no-underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>

        <h3 className="mt-5 font-medium">Changes to this policy</h3>
        <p className="mt-2 text-slate-700">We may update this policy. We will post updates here with a revised “Last updated” date.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">FR — Politique de confidentialité</h2>
        <p className="mt-2 text-slate-700">
          Gifting vous aide à découvrir des cadeaux et à gérer des idées avec vos amis. Cette politique précise quelles données nous traitons, dans quel but, pour
          combien de temps et vos choix.
        </p>

        <h3 className="mt-5 font-medium">Données traitées</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Compte et profil : nom, e‑mail, pays, genre, date de naissance (si fournis), préférences de base.</li>
          <li>
            Contenu applicatif : événements créés, réactions (j’aime, je n’aime pas, liste de souhaits/superLikes, réservations), relations (amis/connexions), tags (occasions, relations, tranches d’âge).
          </li>
          <li>Données d’usage et de terminal : diagnostics et journaux de base (IP, horodatages, journaux d’erreur) pour la fiabilité et la sécurité.</li>
        </ul>

        <h3 className="mt-5 font-medium">Utilisation</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Fournir et améliorer les fonctionnalités (Découverte de cadeaux, listes de souhaits, réservations).</li>
          <li>Assurer la sécurité du compte, prévenir les abus et résoudre les problèmes.</li>
          <li>Respecter nos obligations légales et nos conditions d’utilisation.</li>
        </ul>

        <h3 className="mt-5 font-medium">Bases légales (le cas échéant)</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Contrat : fournir les fonctionnalités de base demandées.</li>
          <li>Intérêt légitime : sécurité et fiabilité du service.</li>
          <li>Consentement : lorsque requis (p. ex. certaines notifications ou analyses optionnelles à l’avenir).</li>
        </ul>

        <h3 className="mt-5 font-medium">Partage</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Fournisseurs : nous utilisons Supabase (hébergement et base de données) et des prestataires d’infrastructure similaires.</li>
          <li>Pas de vente de données personnelles. Aucun partage à des tiers pour leur marketing propre.</li>
          <li>Légal et sécurité : divulgation possible pour respecter la loi ou protéger les utilisateurs et le service.</li>
        </ul>

        <h3 className="mt-5 font-medium">Rétention</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>Les données supprimées dans l’app sont retirées immédiatement de la base active.</li>
          <li>Les sauvegardes et journaux serveur sont en général conservés jusqu’à 30 jours, puis purgés.</li>
        </ul>

        <h3 className="mt-5 font-medium">Vos choix et droits</h3>
        <ul className="ml-6 mt-2 list-disc text-slate-700">
          <li>
            Contrôles dans l’app : suppression du compte (suppression complète) ou suppression des données en conservant le compte. Voir{' '}
            <a className="text-blue-600 underline hover:no-underline" href="/web/data-deletion">Suppression du compte et des données</a>.
          </li>
          <li>Accès/mise à jour : vous pouvez consulter et mettre à jour certaines informations de profil dans l’app.</li>
          <li>Contactez‑nous pour exercer d’autres droits (accès, suppression, portabilité) selon votre juridiction.</li>
        </ul>

        <h3 className="mt-5 font-medium">Enfants</h3>
  <p className="mt-2 text-slate-700">Gifting ne s’adresse pas aux enfants n’ayant pas l’âge requis pour consentir au traitement des données sans accord parental.</p>

        <h3 className="mt-5 font-medium">Transferts internationaux</h3>
        <p className="mt-2 text-slate-700">Les données peuvent être traitées et stockées dans la région de nos prestataires. Nous mettons en place des mesures raisonnables de protection.</p>

        <h3 className="mt-5 font-medium">Contact</h3>
        <p className="mt-2 text-slate-700">
          Questions ou demandes ? E‑mail{' '}
          <a className="text-blue-600 underline hover:no-underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>

        <h3 className="mt-5 font-medium">Modifications</h3>
        <p className="mt-2 text-slate-700">Nous pouvons mettre à jour cette politique. Les mises à jour seront publiées ici avec une nouvelle date « Dernière mise à jour ».</p>
      </section>
    </div>
  );
}
