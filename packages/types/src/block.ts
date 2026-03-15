/** All available block types for the visual editor */
export type BlockType =
  | 'hero'
  | 'navbar'
  | 'section'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'card'
  | 'grid'
  | 'flex'
  | 'form'
  | 'input'
  | 'footer'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'gallery'
  | 'map'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'html'
  | 'blog-list'
  | 'blog-post'
  | 'product-card'
  | 'product-grid'
  | 'cart'
  | 'checkout'
  | 'container'
  | 'columns'
  | 'text'
  | 'link'
  | 'icon'
  | 'list'
  | 'table'
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'cta'
  | 'stats'
  | 'team'
  | 'logo-cloud'
  | 'contact-form'
  | 'newsletter'
  | 'social-links'
  | 'breadcrumb'
  | 'badge'
  | 'alert'
  | 'code-block'
  | 'embed'

/** Styles applied to a block with responsive variants */
export type BlockStyles = {
  className?: string
  responsive?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

/** Core block structure — recursive tree node */
export type Block = {
  id: string
  type: BlockType
  props: BlockProps
  children: Block[]
  styles: BlockStyles
}

/** Action triggered by user interaction on a block */
export type BlockAction = {
  type: 'click' | 'submit' | 'navigate'
  url?: string
  pageId?: string
  blockId?: string
  formId?: string
  openInNewTab?: boolean
  scrollTo?: string
  customJs?: string
}

/** Props for hero section blocks */
export type HeroProps = {
  title: string
  subtitle?: string
  ctaText?: string
  ctaAction?: BlockAction
  secondaryCtaText?: string
  secondaryCtaAction?: BlockAction
  backgroundImage?: string
  backgroundVideo?: string
  alignment?: 'start' | 'center' | 'end'
  height?: 'sm' | 'md' | 'lg' | 'full'
  overlay?: boolean
  overlayOpacity?: number
}

/** Props for navbar blocks */
export type NavbarProps = {
  logo?: string
  logoText?: string
  links: { label: string; url: string; children?: { label: string; url: string }[] }[]
  sticky?: boolean
  transparent?: boolean
  ctaText?: string
  ctaAction?: BlockAction
}

/** Props for heading blocks */
export type HeadingProps = {
  text: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  alignment?: 'start' | 'center' | 'end'
}

/** Props for paragraph blocks */
export type ParagraphProps = {
  text: string
  alignment?: 'start' | 'center' | 'end'
}

/** Props for text blocks (rich text) */
export type TextProps = {
  html: string
  alignment?: 'start' | 'center' | 'end'
}

/** Props for button blocks */
export type ButtonProps = {
  text: string
  action?: BlockAction
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: string
  iconPosition?: 'start' | 'end'
}

/** Props for image blocks */
export type ImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  caption?: string
  link?: BlockAction
  rounded?: boolean
}

/** Props for link blocks */
export type LinkProps = {
  text: string
  url: string
  openInNewTab?: boolean
  underline?: boolean
}

/** Props for icon blocks */
export type IconProps = {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

/** Props for container blocks */
export type ContainerProps = {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: string
  backgroundImage?: string
}

/** Props for columns layout blocks */
export type ColumnsProps = {
  columns: number
  gap?: 'sm' | 'md' | 'lg'
  distribution?: 'equal' | 'left-heavy' | 'right-heavy' | 'center-heavy'
  stackOnMobile?: boolean
}

/** Props for grid layout blocks */
export type GridProps = {
  columns: number
  gap?: 'sm' | 'md' | 'lg'
  minChildWidth?: string
}

/** Props for flex layout blocks */
export type FlexProps = {
  direction?: 'row' | 'column'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: 'sm' | 'md' | 'lg'
  wrap?: boolean
}

/** Props for section blocks */
export type SectionProps = {
  background?: string
  backgroundImage?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

/** Props for card blocks */
export type CardProps = {
  title?: string
  description?: string
  image?: string
  link?: BlockAction
  padding?: 'sm' | 'md' | 'lg'
}

/** Props for list blocks */
export type ListProps = {
  items: string[]
  ordered?: boolean
  icon?: string
}

/** Props for table blocks */
export type TableProps = {
  headers: string[]
  rows: string[][]
  striped?: boolean
  bordered?: boolean
}

/** Props for accordion blocks */
export type AccordionProps = {
  items: { title: string; content: string }[]
  allowMultiple?: boolean
  defaultOpen?: number[]
}

/** Props for tabs blocks */
export type TabsProps = {
  items: { label: string; content: string }[]
  defaultTab?: number
  variant?: 'underline' | 'pills' | 'boxed'
}

/** Props for carousel blocks */
export type CarouselProps = {
  items: { image: string; title?: string; description?: string }[]
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
}

/** Props for CTA blocks */
export type CTAProps = {
  title: string
  description?: string
  ctaText: string
  ctaAction?: BlockAction
  secondaryCtaText?: string
  secondaryCtaAction?: BlockAction
  background?: string
  alignment?: 'start' | 'center' | 'end'
}

/** Props for stats blocks */
export type StatsProps = {
  items: { value: string; label: string; icon?: string }[]
  columns?: 2 | 3 | 4
}

/** Props for team blocks */
export type TeamProps = {
  members: { name: string; role: string; image?: string; bio?: string; social?: { platform: string; url: string }[] }[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
}

/** Props for logo cloud blocks */
export type LogoCloudProps = {
  logos: { src: string; alt: string; url?: string }[]
  title?: string
  grayscale?: boolean
  columns?: 3 | 4 | 5 | 6
}

/** Props for testimonials blocks */
export type TestimonialsProps = {
  items: { quote: string; author: string; role?: string; avatar?: string; rating?: number }[]
  layout?: 'grid' | 'carousel' | 'stack'
  columns?: 1 | 2 | 3
}

/** Props for pricing blocks */
export type PricingProps = {
  plans: { name: string; price: string; period?: string; description?: string; features: string[]; ctaText: string; ctaAction?: BlockAction; highlighted?: boolean }[]
  columns?: 2 | 3 | 4
}

/** Props for FAQ blocks */
export type FAQProps = {
  items: { question: string; answer: string }[]
  layout?: 'accordion' | 'grid'
}

/** Props for gallery blocks */
export type GalleryProps = {
  images: { src: string; alt: string; caption?: string }[]
  layout?: 'grid' | 'masonry' | 'carousel'
  columns?: 2 | 3 | 4
  lightbox?: boolean
}

/** Props for contact form blocks */
export type ContactFormProps = {
  formId?: string
  fields: { name: string; type: 'text' | 'email' | 'tel' | 'textarea' | 'select'; label: string; required?: boolean; options?: string[] }[]
  submitText?: string
  submitAction?: BlockAction
  successMessage?: string
}

/** Props for newsletter blocks */
export type NewsletterProps = {
  title?: string
  description?: string
  placeholder?: string
  submitText?: string
  formId?: string
}

/** Props for social links blocks */
export type SocialLinksProps = {
  links: { platform: string; url: string }[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'pill' | 'outline'
}

/** Props for breadcrumb blocks */
export type BreadcrumbProps = {
  items: { label: string; url?: string }[]
  separator?: string
}

/** Props for badge blocks */
export type BadgeProps = {
  text: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

/** Props for alert blocks */
export type AlertProps = {
  title?: string
  message: string
  variant: 'info' | 'success' | 'warning' | 'error'
  dismissible?: boolean
}

/** Props for code block blocks */
export type CodeBlockProps = {
  code: string
  language?: string
  showLineNumbers?: boolean
  title?: string
}

/** Props for embed blocks */
export type EmbedProps = {
  url?: string
  html?: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

/** Props for video blocks */
export type VideoProps = {
  src: string
  poster?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
}

/** Props for map blocks */
export type MapProps = {
  latitude: number
  longitude: number
  zoom?: number
  marker?: boolean
  address?: string
}

/** Props for footer blocks */
export type FooterProps = {
  columns: { title: string; links: { label: string; url: string }[] }[]
  copyright?: string
  socialLinks?: { platform: string; url: string }[]
  logo?: string
}

/** Props for form blocks */
export type FormBlockProps = {
  formId: string
  fields: { name: string; type: string; label: string; required?: boolean; placeholder?: string }[]
  submitText?: string
  successMessage?: string
}

/** Props for input blocks */
export type InputBlockProps = {
  name: string
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label?: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

/** Props for divider blocks */
export type DividerProps = {
  variant?: 'solid' | 'dashed' | 'dotted'
  color?: string
}

/** Props for spacer blocks */
export type SpacerProps = {
  height: 'sm' | 'md' | 'lg' | 'xl'
}

/** Props for blog list blocks */
export type BlogListProps = {
  categoryId?: string
  limit?: number
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
  showExcerpt?: boolean
  showImage?: boolean
}

/** Props for blog post blocks */
export type BlogPostProps = {
  postId?: string
  showAuthor?: boolean
  showDate?: boolean
  showTags?: boolean
  showRelated?: boolean
}

/** Props for product card blocks */
export type ProductCardProps = {
  productId: string
  showPrice?: boolean
  showRating?: boolean
  showAddToCart?: boolean
}

/** Props for product grid blocks */
export type ProductGridProps = {
  categoryId?: string
  limit?: number
  columns?: 2 | 3 | 4
  showFilters?: boolean
  sortBy?: 'price' | 'name' | 'newest'
}

/** Props for cart blocks */
export type CartBlockProps = {
  showSummary?: boolean
  showCoupon?: boolean
}

/** Props for checkout blocks */
export type CheckoutBlockProps = {
  paymentMethods?: ('stripe' | 'payplus')[]
  showOrderSummary?: boolean
}

/** Discriminated union of all block props by block type */
export type BlockProps =
  | (HeroProps & { _type?: 'hero' })
  | (NavbarProps & { _type?: 'navbar' })
  | (SectionProps & { _type?: 'section' })
  | (HeadingProps & { _type?: 'heading' })
  | (ParagraphProps & { _type?: 'paragraph' })
  | (ButtonProps & { _type?: 'button' })
  | (ImageProps & { _type?: 'image' })
  | (CardProps & { _type?: 'card' })
  | (GridProps & { _type?: 'grid' })
  | (FlexProps & { _type?: 'flex' })
  | (FormBlockProps & { _type?: 'form' })
  | (InputBlockProps & { _type?: 'input' })
  | (FooterProps & { _type?: 'footer' })
  | (TestimonialsProps & { _type?: 'testimonials' })
  | (PricingProps & { _type?: 'pricing' })
  | (FAQProps & { _type?: 'faq' })
  | (GalleryProps & { _type?: 'gallery' })
  | (MapProps & { _type?: 'map' })
  | (VideoProps & { _type?: 'video' })
  | (DividerProps & { _type?: 'divider' })
  | (SpacerProps & { _type?: 'spacer' })
  | (ContainerProps & { _type?: 'container' })
  | (ColumnsProps & { _type?: 'columns' })
  | (TextProps & { _type?: 'text' })
  | (LinkProps & { _type?: 'link' })
  | (IconProps & { _type?: 'icon' })
  | (ListProps & { _type?: 'list' })
  | (TableProps & { _type?: 'table' })
  | (AccordionProps & { _type?: 'accordion' })
  | (TabsProps & { _type?: 'tabs' })
  | (CarouselProps & { _type?: 'carousel' })
  | (CTAProps & { _type?: 'cta' })
  | (StatsProps & { _type?: 'stats' })
  | (TeamProps & { _type?: 'team' })
  | (LogoCloudProps & { _type?: 'logo-cloud' })
  | (ContactFormProps & { _type?: 'contact-form' })
  | (NewsletterProps & { _type?: 'newsletter' })
  | (SocialLinksProps & { _type?: 'social-links' })
  | (BreadcrumbProps & { _type?: 'breadcrumb' })
  | (BadgeProps & { _type?: 'badge' })
  | (AlertProps & { _type?: 'alert' })
  | (CodeBlockProps & { _type?: 'code-block' })
  | (EmbedProps & { _type?: 'embed' })
  | (BlogListProps & { _type?: 'blog-list' })
  | (BlogPostProps & { _type?: 'blog-post' })
  | (ProductCardProps & { _type?: 'product-card' })
  | (ProductGridProps & { _type?: 'product-grid' })
  | (CartBlockProps & { _type?: 'cart' })
  | (CheckoutBlockProps & { _type?: 'checkout' })
  | Record<string, unknown>
