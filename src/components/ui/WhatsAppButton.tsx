import WhatsAppIcon from './WhatsAppIcon';

interface WhatsAppButtonProps {
  href?: string;
}

export default function WhatsAppButton({ href = '#' }: WhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp"
      className="whatsapp-float"
    >
      <WhatsAppIcon size={32} />
    </a>
  );
}
