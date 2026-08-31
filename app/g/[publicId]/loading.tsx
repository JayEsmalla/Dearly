export default function GiftLoading() {
  return (
    <main className="public-gift-loading" aria-busy="true" aria-live="polite">
      <span className="public-brand">♥ <i>Dearly</i></span>
      <div className="gift-loading-card" role="status">
        <span className="gift-loading-heart" aria-hidden="true">♥</span>
        <p>Preparing your gift</p>
        <h1>Something thoughtful is on its way.</h1>
        <div className="gift-loading-dots" aria-hidden="true"><i /><i /><i /></div>
        <small>Dearly is getting everything ready for you.</small>
      </div>
    </main>
  );
}
