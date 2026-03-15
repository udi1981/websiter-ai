/**
 * Curated Unsplash photo library organized by industry and media slot role.
 * Each photo ID is hand-selected for quality, composition, and relevance.
 * Format: Unsplash photo IDs (used as: https://images.unsplash.com/photo-{id})
 */

import type { MediaSlotRole } from './media-slots'

type IndustryMediaMap = Partial<Record<MediaSlotRole, string[]>>

/**
 * Curated photo library: 200+ photos across 17 industries.
 */
export const MEDIA_LIBRARY: Record<string, IndustryMediaMap> = {
  restaurant: {
    'hero-bg': [
      '1517248135467-4c7edcad34c4',
      '1414235077428-338989a2e8c0',
      '1552566626-52f8b828add9',
      '1537047902294-62a40c20a6ae',
      '1466978913421-dad2ebd01d17',
    ],
    'hero-image': [
      '1504674900247-0877df9cc836',
      '1476224203421-9ac39bcb3327',
      '1555396273-367ea4eb4db5',
      '1540189549336-e6e99c3679fe',
      '1565299624946-b28f40a0ae38',
    ],
    'feature-image': [
      '1498837167922-ddd27525d352',
      '1490818387583-1baba5e638af',
      '1506354666786-959d6d497f1a',
      '1543353071-087092ec393a',
      '1547592180-85f173990554',
    ],
    'about-image': [
      '1556910103-1c02745aae4d',
      '1577219491135-cd391a7c4fd1',
      '1581349485608-9469926a8e5e',
    ],
    'gallery-item': [
      '1567620905732-2d1ec7ab7445',
      '1565958011703-44f9829ba187',
      '1482049016688-2d3e1b311543',
      '1432139555190-58524dae6a55',
      '1529692236671-f1f6cf9683ba',
      '1504754524776-8f4f37790ca0',
      '1473093295043-cdd812d0e601',
      '1414235077428-338989a2e8c0',
    ],
    'team-avatar': [
      '1583394838336-acd977736f90',
      '1577219491135-cd391a7c4fd1',
      '1581349485608-9469926a8e5e',
    ],
  },
  dental: {
    'hero-bg': [
      '1629909613654-28e377c37b09',
      '1588776814546-1ffcf47267a5',
      '1606811841689-23dfddce3e95',
    ],
    'hero-image': [
      '1598256989800-fe5f95da9787',
      '1606811971618-4486d14f3f99',
      '1445527815219-ecbfec67d3f4',
    ],
    'feature-image': [
      '1609840114035-3c981b782dfe',
      '1588776814546-1ffcf47267a5',
      '1629909614854-d82a4bb8612e',
    ],
    'about-image': [
      '1629909613654-28e377c37b09',
      '1612349317150-e413f6a5b16d',
    ],
    'gallery-item': [
      '1629909613654-28e377c37b09',
      '1588776814546-1ffcf47267a5',
      '1606811841689-23dfddce3e95',
      '1598256989800-fe5f95da9787',
    ],
    'team-avatar': [
      '1612349317150-e413f6a5b16d',
      '1559839734-2b71ea197ec2',
      '1537368910025-700350fe46c7',
    ],
  },
  law: {
    'hero-bg': [
      '1589829545856-d10d557cf95f',
      '1497366216548-37526070297c',
      '1521587760476-6c12a4b040da',
    ],
    'hero-image': [
      '1450101499163-c8848e968838',
      '1507679799987-c73779587ccf',
      '1589391886645-d51941baf7fb',
    ],
    'feature-image': [
      '1450101499163-c8848e968838',
      '1521587760476-6c12a4b040da',
      '1497366216548-37526070297c',
    ],
    'about-image': [
      '1507679799987-c73779587ccf',
      '1497366216548-37526070297c',
    ],
    'gallery-item': [
      '1589829545856-d10d557cf95f',
      '1507679799987-c73779587ccf',
      '1521587760476-6c12a4b040da',
      '1450101499163-c8848e968838',
    ],
    'team-avatar': [
      '1560250097-0b93528c311a',
      '1507003211169-0a1dd7228f2d',
      '1573496359142-b8d87734a5a2',
    ],
  },
  realestate: {
    'hero-bg': [
      '1600596542815-ffad4c1539a9',
      '1600585154340-be6161a56a0c',
      '1512917774080-9991f1c4c750',
      '1600607687939-ce8a6c25118c',
    ],
    'hero-image': [
      '1560448204-e02f11c3d0e2',
      '1600566753086-00f18e6b51a1',
      '1600585154526-990dced4db0d',
    ],
    'feature-image': [
      '1560448204-e02f11c3d0e2',
      '1600566753190-17f0baa2a6c3',
      '1600585154340-be6161a56a0c',
    ],
    'about-image': [
      '1560518883-ce09059eeffa',
      '1600607687939-ce8a6c25118c',
    ],
    'gallery-item': [
      '1600596542815-ffad4c1539a9',
      '1600585154340-be6161a56a0c',
      '1600566753086-00f18e6b51a1',
      '1560448204-e02f11c3d0e2',
      '1512917774080-9991f1c4c750',
      '1600607687939-ce8a6c25118c',
    ],
    'team-avatar': [
      '1573496359142-b8d87734a5a2',
      '1560250097-0b93528c311a',
      '1507003211169-0a1dd7228f2d',
    ],
  },
  fitness: {
    'hero-bg': [
      '1534438327276-14e5300c3a48',
      '1571019614242-c5c5dee9f50b',
      '1517836357463-d25dfeac3438',
    ],
    'hero-image': [
      '1540497077202-8b9cf3a2e4f6',
      '1476480862126-209bfaa8edc8',
      '1517836357463-d25dfeac3438',
    ],
    'feature-image': [
      '1534438327276-14e5300c3a48',
      '1540497077202-8b9cf3a2e4f6',
      '1571019614242-c5c5dee9f50b',
    ],
    'about-image': [
      '1571019614242-c5c5dee9f50b',
      '1534438327276-14e5300c3a48',
    ],
    'gallery-item': [
      '1534438327276-14e5300c3a48',
      '1571019614242-c5c5dee9f50b',
      '1517836357463-d25dfeac3438',
      '1540497077202-8b9cf3a2e4f6',
      '1476480862126-209bfaa8edc8',
    ],
    'team-avatar': [
      '1549476464-37392f717541',
      '1548690312-e3b507d8c110',
      '1550345332-09e3ac987658',
    ],
  },
  photography: {
    'hero-bg': [
      '1452587925148-ce544e77e70d',
      '1493863641943-9b68992a8d07',
      '1502920917128-1aa500764cbd',
    ],
    'hero-image': [
      '1554080353-a576cf803bda',
      '1542038784456-1ea8e935640e',
      '1452587925148-ce544e77e70d',
    ],
    'feature-image': [
      '1502920917128-1aa500764cbd',
      '1493863641943-9b68992a8d07',
      '1554080353-a576cf803bda',
    ],
    'about-image': [
      '1542038784456-1ea8e935640e',
      '1554080353-a576cf803bda',
    ],
    'gallery-item': [
      '1452587925148-ce544e77e70d',
      '1493863641943-9b68992a8d07',
      '1502920917128-1aa500764cbd',
      '1554080353-a576cf803bda',
      '1542038784456-1ea8e935640e',
      '1516035069371-29a1b244cc32',
      '1541516160071-4bb0c5af65ba',
      '1470071459604-3b5ec3a7fe05',
    ],
    'team-avatar': [
      '1492562080023-ab3db95bfbce',
      '1507003211169-0a1dd7228f2d',
      '1544005313-94ddf0286df2',
    ],
  },
  saas: {
    'hero-bg': [
      '1460925895917-afdab827c52f',
      '1551434678-e076c223a692',
      '1519389950473-47ba0277781c',
    ],
    'hero-image': [
      '1553877522-43269d4ea984',
      '1531482615713-2afd69097998',
      '1460925895917-afdab827c52f',
    ],
    'feature-image': [
      '1551434678-e076c223a692',
      '1519389950473-47ba0277781c',
      '1553877522-43269d4ea984',
    ],
    'about-image': [
      '1531482615713-2afd69097998',
      '1519389950473-47ba0277781c',
    ],
    'gallery-item': [
      '1460925895917-afdab827c52f',
      '1551434678-e076c223a692',
      '1519389950473-47ba0277781c',
      '1553877522-43269d4ea984',
    ],
    'team-avatar': [
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
      '1573496359142-b8d87734a5a2',
    ],
  },
  ecommerce: {
    'hero-bg': [
      '1472851294608-062f824d29cc',
      '1441986300917-64674bd600d8',
      '1556742049-0cfed4f6a45d',
    ],
    'hero-image': [
      '1483985988355-763728e1935b',
      '1607082349566-187342175e2f',
      '1556742049-0cfed4f6a45d',
    ],
    'feature-image': [
      '1472851294608-062f824d29cc',
      '1441986300917-64674bd600d8',
      '1483985988355-763728e1935b',
    ],
    'about-image': [
      '1607082349566-187342175e2f',
      '1556742049-0cfed4f6a45d',
    ],
    'gallery-item': [
      '1472851294608-062f824d29cc',
      '1441986300917-64674bd600d8',
      '1556742049-0cfed4f6a45d',
      '1483985988355-763728e1935b',
      '1607082349566-187342175e2f',
    ],
    'team-avatar': [
      '1494790108377-be9c29b29330',
      '1560250097-0b93528c311a',
      '1507003211169-0a1dd7228f2d',
    ],
  },
  portfolio: {
    'hero-bg': [
      '1558618666-fcd25c85f82e',
      '1460925895917-afdab827c52f',
      '1504639725590-34d0984388bd',
    ],
    'hero-image': [
      '1558618666-fcd25c85f82e',
      '1504639725590-34d0984388bd',
    ],
    'gallery-item': [
      '1558618666-fcd25c85f82e',
      '1504639725590-34d0984388bd',
      '1460925895917-afdab827c52f',
      '1559136555-9303baea8ebd',
      '1541516160071-4bb0c5af65ba',
      '1470071459604-3b5ec3a7fe05',
    ],
    'about-image': [
      '1504639725590-34d0984388bd',
    ],
    'team-avatar': [
      '1507003211169-0a1dd7228f2d',
      '1544005313-94ddf0286df2',
    ],
  },
  business: {
    'hero-bg': [
      '1497366216548-37526070297c',
      '1497215728101-856f4ea42174',
      '1522071820081-009f0129c71c',
    ],
    'hero-image': [
      '1504384308090-c894fdcc538d',
      '1556761175-5973dc0f32e7',
      '1522071820081-009f0129c71c',
    ],
    'feature-image': [
      '1497366216548-37526070297c',
      '1504384308090-c894fdcc538d',
      '1497215728101-856f4ea42174',
    ],
    'about-image': [
      '1522071820081-009f0129c71c',
      '1497366216548-37526070297c',
    ],
    'gallery-item': [
      '1497366216548-37526070297c',
      '1497215728101-856f4ea42174',
      '1522071820081-009f0129c71c',
      '1504384308090-c894fdcc538d',
    ],
    'team-avatar': [
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
      '1500648767791-00dcc994a43e',
      '1438761681033-6461ffad8d80',
    ],
  },
  salon: {
    'hero-bg': [
      '1560066984-138dadb4c035',
      '1522337360788-8b13dee7a37e',
      '1521590832167-7228fcaadc2a',
    ],
    'hero-image': [
      '1560066984-138dadb4c035',
      '1522337360788-8b13dee7a37e',
    ],
    'feature-image': [
      '1560066984-138dadb4c035',
      '1522337360788-8b13dee7a37e',
      '1521590832167-7228fcaadc2a',
    ],
    'about-image': [
      '1521590832167-7228fcaadc2a',
    ],
    'gallery-item': [
      '1560066984-138dadb4c035',
      '1522337360788-8b13dee7a37e',
      '1521590832167-7228fcaadc2a',
      '1516975080664-ed2fc6a32937',
    ],
    'team-avatar': [
      '1580618672591-eb180b1a973f',
      '1494790108377-be9c29b29330',
      '1573496359142-b8d87734a5a2',
    ],
  },
  yoga: {
    'hero-bg': [
      '1545205597-3d9d02c29597',
      '1506126613408-eca07ce68773',
      '1544367567-0f2fcb009e0b',
    ],
    'hero-image': [
      '1545205597-3d9d02c29597',
      '1506126613408-eca07ce68773',
    ],
    'feature-image': [
      '1544367567-0f2fcb009e0b',
      '1545205597-3d9d02c29597',
    ],
    'about-image': [
      '1506126613408-eca07ce68773',
    ],
    'gallery-item': [
      '1545205597-3d9d02c29597',
      '1506126613408-eca07ce68773',
      '1544367567-0f2fcb009e0b',
      '1510894347713-fc3ed6fdf539',
    ],
    'team-avatar': [
      '1544005313-94ddf0286df2',
      '1438761681033-6461ffad8d80',
    ],
  },
  construction: {
    'hero-bg': [
      '1504307651254-35680f356dfd',
      '1541888946425-d81bb19240f5',
      '1503387762-592deb58ef4e',
    ],
    'hero-image': [
      '1504307651254-35680f356dfd',
      '1541888946425-d81bb19240f5',
    ],
    'feature-image': [
      '1503387762-592deb58ef4e',
      '1504307651254-35680f356dfd',
    ],
    'about-image': [
      '1541888946425-d81bb19240f5',
    ],
    'gallery-item': [
      '1504307651254-35680f356dfd',
      '1541888946425-d81bb19240f5',
      '1503387762-592deb58ef4e',
      '1486406146926-c627a92ad1ab',
    ],
    'team-avatar': [
      '1507003211169-0a1dd7228f2d',
      '1472099645785-5658abf4ff4e',
    ],
  },
  consulting: {
    'hero-bg': [
      '1497366216548-37526070297c',
      '1497215728101-856f4ea42174',
      '1522071820081-009f0129c71c',
    ],
    'hero-image': [
      '1556761175-5973dc0f32e7',
      '1504384308090-c894fdcc538d',
    ],
    'feature-image': [
      '1497366216548-37526070297c',
      '1504384308090-c894fdcc538d',
    ],
    'about-image': [
      '1522071820081-009f0129c71c',
    ],
    'gallery-item': [
      '1497366216548-37526070297c',
      '1497215728101-856f4ea42174',
      '1522071820081-009f0129c71c',
      '1556761175-5973dc0f32e7',
    ],
    'team-avatar': [
      '1560250097-0b93528c311a',
      '1573496359142-b8d87734a5a2',
      '1507003211169-0a1dd7228f2d',
    ],
  },
  education: {
    'hero-bg': [
      '1523050854058-8df90110c9f1',
      '1524178232363-1fb2b075b655',
      '1509062522246-3755977927d7',
    ],
    'hero-image': [
      '1523050854058-8df90110c9f1',
      '1524178232363-1fb2b075b655',
    ],
    'feature-image': [
      '1509062522246-3755977927d7',
      '1523050854058-8df90110c9f1',
    ],
    'about-image': [
      '1524178232363-1fb2b075b655',
    ],
    'gallery-item': [
      '1523050854058-8df90110c9f1',
      '1524178232363-1fb2b075b655',
      '1509062522246-3755977927d7',
      '1503676260728-1c00da094a0b',
    ],
    'team-avatar': [
      '1494790108377-be9c29b29330',
      '1507003211169-0a1dd7228f2d',
      '1438761681033-6461ffad8d80',
    ],
  },
  healthcare: {
    'hero-bg': [
      '1519494026-35cdec5f5eb1',
      '1538108149393-fbbd81895907',
      '1551190822-a9ec0670b2ee',
    ],
    'hero-image': [
      '1551190822-a9ec0670b2ee',
      '1538108149393-fbbd81895907',
    ],
    'feature-image': [
      '1519494026-35cdec5f5eb1',
      '1538108149393-fbbd81895907',
    ],
    'about-image': [
      '1551190822-a9ec0670b2ee',
    ],
    'gallery-item': [
      '1519494026-35cdec5f5eb1',
      '1538108149393-fbbd81895907',
      '1551190822-a9ec0670b2ee',
      '1579684385127-1ef15d508118',
    ],
    'team-avatar': [
      '1559839734-2b71ea197ec2',
      '1537368910025-700350fe46c7',
      '1612349317150-e413f6a5b16d',
    ],
  },
  blog: {
    'hero-bg': [
      '1455390582262-044cdead277a',
      '1488190211105-8b0e65b80b4e',
      '1499750310107-5fef28a66643',
    ],
    'hero-image': [
      '1455390582262-044cdead277a',
      '1488190211105-8b0e65b80b4e',
    ],
    'feature-image': [
      '1499750310107-5fef28a66643',
      '1455390582262-044cdead277a',
    ],
    'about-image': [
      '1488190211105-8b0e65b80b4e',
    ],
    'gallery-item': [
      '1455390582262-044cdead277a',
      '1488190211105-8b0e65b80b4e',
      '1499750310107-5fef28a66643',
    ],
    'team-avatar': [
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
    ],
  },
}

/**
 * Portrait photos for team members and testimonial avatars.
 */
export const PORTRAIT_LIBRARY: string[] = [
  '1507003211169-0a1dd7228f2d',
  '1494790108377-be9c29b29330',
  '1500648767791-00dcc994a43e',
  '1438761681033-6461ffad8d80',
  '1472099645785-5658abf4ff4e',
  '1544005313-94ddf0286df2',
  '1560250097-0b93528c311a',
  '1573496359142-b8d87734a5a2',
  '1559839734-2b71ea197ec2',
  '1537368910025-700350fe46c7',
  '1580618672591-eb180b1a973f',
  '1492562080023-ab3db95bfbce',
  '1548690312-e3b507d8c110',
  '1549476464-37392f717541',
  '1612349317150-e413f6a5b16d',
  '1583394838336-acd977736f90',
]

/**
 * Returns a curated photo ID for a specific industry + role, with index rotation.
 */
export const getCuratedPhotoId = (industry: string, role: MediaSlotRole, index = 0): string | null => {
  const industryPhotos = MEDIA_LIBRARY[industry]
  if (!industryPhotos) return null

  const rolePhotos = industryPhotos[role]
  if (!rolePhotos || rolePhotos.length === 0) return null

  return rolePhotos[index % rolePhotos.length]
}

/**
 * Returns a portrait photo ID with index rotation.
 */
export const getPortraitPhotoId = (index: number): string => {
  return PORTRAIT_LIBRARY[index % PORTRAIT_LIBRARY.length]
}

/**
 * Builds a full Unsplash URL from a photo ID.
 */
export const buildUnsplashUrl = (photoId: string, width = 800, quality = 80): string => {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=${quality}&auto=format&fit=crop`
}

/**
 * Builds a portrait Unsplash URL with face cropping.
 */
export const buildPortraitUrl = (photoId: string, width = 400, quality = 80): string => {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=${quality}&auto=format&fit=crop&crop=faces`
}
