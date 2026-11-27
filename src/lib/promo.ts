export type Promo = { discount: number; slotsLeft: number; endsAt: string };

export const promoActive = (p: Promo, now = new Date()) =>
	p.slotsLeft > 0 && now < new Date(p.endsAt);

// Price a visitor pays right now; only the setup packages are discountable
export const priceNow = (
	regular: number,
	discountable: boolean,
	p: Promo,
	now = new Date(),
) => (discountable && promoActive(p, now) ? regular - p.discount : regular);

export const baht = (n: number) => n.toLocaleString("en-US");
