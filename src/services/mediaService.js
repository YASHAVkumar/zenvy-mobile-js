import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export async function persistWardrobePhoto(sourceUri) {
  if (!sourceUri) return '';
  if (Platform.OS === 'web') return sourceUri;
  const folder = new Directory(Paths.document, 'wardrobe');
  folder.create({ idempotent: true, intermediates: true });
  const extension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase();
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension) ? extension : 'jpg';
  const destination = new File(folder, `piece-${Date.now()}.${safeExtension}`);
  await new File(sourceUri).copy(destination);
  return destination.uri;
}
