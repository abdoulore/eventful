export default async function Head({ params }) {
  // Open Graph meta tags for rich social media previews
  return (
    <>
      <title>Event | Eventful</title>
      <meta property="og:site_name" content="Eventful" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}