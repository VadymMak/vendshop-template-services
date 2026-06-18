export default function DecorativeDivider() {
  return (
    <div className="decorative-divider">
      <div className="decorative-divider__stripe decorative-divider__stripe--dark" />
      <div className="decorative-divider__stripe decorative-divider__stripe--gold" />
      <div className="decorative-divider__stripe decorative-divider__stripe--white" />
      <div className="decorative-divider__stripe decorative-divider__stripe--dark" />
    </div>
  );
}
