export type PaletteScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** Marca de un tenant tal como la entrega el backend (mapeada por el shell). */
export interface BrandConfig {
  tenantName: string;
  /** #RRGGBB — obligatorio. */
  primaryColor: string;
  primaryDimColor?: string;
  primaryContainerColor?: string;
  secondaryColor?: string;
  errorColor?: string;
  /** Logo para fondo claro. */
  logoUrl?: string | null;
  /** Logo para fondo de color/oscuro (va sobre el sidebar). */
  logoDarkUrl?: string | null;
  /** Futuro: isotipo cuadrado. */
  iconUrl?: string | null;
  /** Futuro: si falta, se usa primaryColor. */
  sidebarColor?: string;
  /** Futuro: si falta, se usa 'Plus Jakarta Sans'. */
  fontFamily?: string;
}

/** Marca con todos los valores derivados que necesita la UI. */
export interface ResolvedBrand {
  tenantName: string;
  initial: string;
  primary: string;
  palette: Record<PaletteScale, string>;
  onBrand: string;
  brandTextLight: string;
  brandTextDark: string;
  brandSoftLight: string;
  brandSoftDark: string;
  sidebarBg: string;
  sidebarFg: string;
  sidebarFgMuted: string;
  sidebarActiveBg: string;
  secondary: string;
  error: string;
  logoOnLight: string | null;
  logoOnBrand: string | null;
  iconUrl: string | null;
  fontFamily: string;
}
