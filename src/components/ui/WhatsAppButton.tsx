import { WHATSAPP_LINKS } from '@/lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINKS.general}
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp"
      className="whatsapp-float"
    >
      <WhatsAppIcon size={32} />
    </a>
  );
}
