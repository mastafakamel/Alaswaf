function formatDate(d) {
    if (!d) return "غير محدد";
    const dt = new Date(d);
    return dt.toISOString().slice(0, 10);
  }
  
  function buildBookingMessage({ offer, booking }) {
    const lines = [
      "السلام عليكم 🌿",
      "أود حجز العرض التالي:",
      "",
      `🧾 العرض: ${offer.title}`,
      `🏷️ النوع: ${offer.category}`,
      `📍 المغادرة: ${booking.departureCity}`,
      `👥 عدد الأشخاص: ${booking.travelersCount}`,
      `📅 تاريخ مفضل: ${formatDate(booking.preferredDate)}`,
      `💰 السعر: ${offer.price} ${offer.currency}`,
      `📝 ملاحظات: ${booking.notes?.trim() ? booking.notes.trim() : "—"}`,
      "",
      `👤 الاسم: ${booking.clientName}`,
      `📱 واتساب العميل: ${booking.clientWhatsapp}`,
      "",
      "جزاكم الله خيرًا، في انتظار التأكيد 🙏",
    ];
  
    return lines.join("\n");
  }
  
  function buildWhatsAppLink(e164, message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${e164}?text=${encoded}`;
  }
  
  module.exports = { buildBookingMessage, buildWhatsAppLink };
  