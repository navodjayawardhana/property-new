/**
 * Homepage Slides management screen.
 *
 * Controls the media carousel shown at the top of the public app's home page.
 * Fetches from GET /admin/slides. Maximum of MAX_SLIDES = 6 slides allowed.
 *
 * Each slide has:
 *   - Optional title and subtitle text overlaid on the media
 *   - Media: image (JPEG/PNG/WEBP) or video (MP4/MOV) picked from device
 *   - sort_order: determines carousel order (lower = first)
 *   - is_active: inactive slides are hidden from the public app
 *
 * Add flow:
 *   1. Tap "Add Slide" → opens an inline form at the bottom
 *   2. Pick media (image or video) → preview shown immediately
 *   3. Save → POST /admin/slides (FormData with media file)
 *
 * Per-slide actions:
 *   - Toggle active/inactive inline → PATCH /admin/slides/:id  { is_active }
 *   - Delete → DELETE /admin/slides/:id (with confirmation modal)
 *
 * VideoPreview renders a playable inline video using expo-video's VideoView.
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/Badge';
import { CustomSwitch } from '@/components/CustomSwitch';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { ScreenLoader } from '@/components/ScreenLoader';
import { Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminSlides } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Slide } from '@/lib/types';

const MAX_SLIDES = 6;

type AddForm = {
  title: string;
  subtitle: string;
  mediaUri: string | null;
  mediaType: 'image' | 'video';
  mimeType: string | null;
  fileName: string | null;
};
const emptyForm = (): AddForm => ({ title: '', subtitle: '', mediaUri: null, mediaType: 'image', mimeType: null, fileName: null });

function VideoPreview({ uri, style }: { uri: string; style: object }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={style}
      allowsFullscreen
      allowsPictureInPicture={false}
      nativeControls
    />
  );
}

export default function SlidesScreen() {
  const { token } = useAuth();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Slide | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [form, setForm] = useState<AddForm>(emptyForm());
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminSlides.list(token);
      setSlides(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      toast.error('Failed to Load Slides', friendlyError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/webm'];

  const pickMedia = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      const isVideo = asset.type === 'video';
      const mime = asset.mimeType ?? '';
      const allowed = isVideo ? ALLOWED_VIDEO_MIMES : ALLOWED_IMAGE_MIMES;
      if (mime && !allowed.includes(mime)) {
        toast.warning(
          'Unsupported Format',
          isVideo
            ? 'Only MP4, MOV, and WEBM videos are accepted.'
            : 'Only JPG, PNG, and WEBP images are accepted.'
        );
        return;
      }
      setForm((f) => ({
        ...f,
        mediaUri: asset.uri,
        mediaType: isVideo ? 'video' : 'image',
        mimeType: asset.mimeType ?? null,
        fileName: asset.fileName ?? null,
      }));
    }
  };

  const handleReset = () => setForm(emptyForm());

  const handleAdd = async () => {
    if (!token) return;
    if (!form.mediaUri) { toast.warning('Validation', 'Please select an image or video.'); return; }
    if (slides.length >= MAX_SLIDES) { toast.warning('Limit Reached', `Maximum ${MAX_SLIDES} slides allowed.`); return; }

    setAdding(true);
    try {
      const fd = new FormData();
      // Use the MIME type the picker reported — critical for .mov files which are
      // video/quicktime, not video/mov that a naive ext→mime mapping would produce.
      const ext = (form.fileName ?? form.mediaUri).split('.').pop()?.toLowerCase() ?? 'mp4';
      const mimeType = form.mimeType ?? (form.mediaType === 'video' ? `video/${ext}` : `image/${ext}`);
      const fileName = form.fileName ?? `slide.${ext}`;
      fd.append('media', { uri: form.mediaUri, name: fileName, type: mimeType } as unknown as Blob);
      if (form.title.trim()) fd.append('title', form.title.trim());
      if (form.subtitle.trim()) fd.append('subtitle', form.subtitle.trim());

      const created = await adminSlides.create(token, fd);
      setSlides((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      toast.error('Add Failed', friendlyError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (slide: Slide) => {
    if (!token) return;
    setTogglingId(slide.id);
    try {
      const updated = await adminSlides.update(token, slide.id, { is_active: !slide.is_active });
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminSlides.delete(token, deleteTarget.id);
      setSlides((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const isToggling = togglingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.thumbWrap}>
            {item.media_type === 'image' ? (
              <Image source={{ uri: item.media_url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.videoThumb]}>
                <Ionicons name="play-circle" size={32} color="#fff" />
              </View>
            )}
            {item.media_type === 'video' && (
              <View style={styles.videoTag}>
                <Ionicons name="videocam" size={10} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.slideInfo}>
            {item.title ? (
              <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
            ) : (
              <Text style={styles.noTitle}>No title</Text>
            )}
            {item.subtitle && (
              <Text style={styles.slideSubtitle} numberOfLines={2}>{item.subtitle}</Text>
            )}
            <View style={styles.badgeRow}>
              <Badge
                label={item.media_type}
                bg={item.media_type === 'video' ? Colors.purpleLight : Colors.infoLight}
                color={item.media_type === 'video' ? Colors.purple : Colors.info}
              />
              <Badge
                label={item.is_active ? 'Active' : 'Inactive'}
                bg={item.is_active ? Colors.primaryLight : Colors.gray100}
                color={item.is_active ? Colors.primary : Colors.gray600}
              />
            </View>
          </View>

          <View style={styles.cardActions}>
            {isToggling ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <CustomSwitch
                value={item.is_active}
                onValueChange={() => handleToggleActive(item)}
                size="sm"
              />
            )}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const canAdd = slides.length < MAX_SLIDES;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarRow}>
          <View>
            <Text style={styles.toolbarTitle}>{slides.length} / {MAX_SLIDES} slides</Text>
            <Text style={styles.toolbarSub}>{canAdd ? `${MAX_SLIDES - slides.length} slots remaining` : 'Maximum slides reached'}</Text>
          </View>
          {canAdd && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm((v) => !v)}>
              <Ionicons name={showForm ? 'chevron-up' : 'add'} size={18} color="#fff" />
              <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add Slide'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!canAdd && (
          <View style={styles.maxAlert}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.warning} />
            <Text style={styles.maxAlertText}>Delete a slide to add a new one</Text>
          </View>
        )}
      </View>

      {/* Add Form */}
      {showForm && canAdd && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.addForm} contentContainerStyle={styles.addFormContent}>
            <Text style={styles.formTitle}>New Slide</Text>

            {form.mediaUri && form.mediaType === 'video' ? (
              <View style={styles.mediaPicker}>
                <VideoPreview uri={form.mediaUri} style={styles.mediaPreview} />
                <TouchableOpacity style={styles.mediaChangeBtn} onPress={pickMedia}>
                  <Ionicons name="pencil-outline" size={13} color="#fff" />
                  <Text style={styles.mediaChangeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
                {form.mediaUri ? (
                  <View>
                    <Image source={{ uri: form.mediaUri }} style={styles.mediaPreview} />
                    <View style={styles.mediaChangeBtn}>
                      <Ionicons name="pencil-outline" size={13} color="#fff" />
                      <Text style={styles.mediaChangeBtnText}>Change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.mediaPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color={Colors.textLight} />
                    <Text style={styles.mediaPlaceholderText}>Tap to select image or video</Text>
                    <Text style={styles.mediaPlaceholderSub}>JPG, PNG, WEBP, MP4, MOV · max 50MB</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Title (optional)</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm((f) => ({ ...f, title: t }))} placeholder="Slide title" placeholderTextColor={Colors.textLight} maxLength={100} />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Subtitle (optional)</Text>
              <TextInput style={[styles.input, styles.textarea]} value={form.subtitle} onChangeText={(t) => setForm((f) => ({ ...f, subtitle: t }))} placeholder="Slide subtitle" placeholderTextColor={Colors.textLight} multiline numberOfLines={2} textAlignVertical="top" maxLength={200} />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setResetConfirm(true)} disabled={adding} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, adding && styles.submitBtnDisabled]} onPress={handleAdd} disabled={adding}>
                {adding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Upload Slide</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {loading ? (
        <ScreenLoader message="Loading slides…" />
      ) : (
        <FlatList
          data={slides}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderSlide}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="images-outline" title="No slides added" subtitle="Add your first homepage slide" />}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Slide"
        message="Delete this slide? It will be removed from the homepage immediately."
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        visible={resetConfirm}
        title="Reset Form"
        message="All entered data and selected media will be cleared. Continue?"
        confirmLabel="Reset"
        confirmColor={Colors.danger}
        onConfirm={() => { setResetConfirm(false); handleReset(); }}
        onCancel={() => setResetConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.card },
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  toolbarSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  maxAlert: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  maxAlertText: { fontSize: 12, color: Colors.warning, fontWeight: '500' },
  // Add Form
  addForm: { backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 440 },
  addFormContent: { padding: 16, gap: 12 },
  formTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  mediaPicker: { borderRadius: 12, overflow: 'hidden' },
  mediaPreview: { width: '100%', height: 200 },
  mediaChangeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mediaChangeBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  mediaPlaceholder: { height: 140, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.gray50 },
  mediaPlaceholderText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  mediaPlaceholderSub: { fontSize: 11, color: Colors.textLight },
  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: Colors.text },
  textarea: { minHeight: 64 },
  actionRow: { flexDirection: 'row', gap: 10 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 13, minHeight: 48, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 20 },
  resetBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, minHeight: 48 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  // List
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  orderBadge: { position: 'absolute', top: 10, left: 10, zIndex: 1, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  orderText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cardRow: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center' },
  thumbWrap: { position: 'relative' },
  thumb: { width: 90, height: 72, borderRadius: 10, resizeMode: 'cover', backgroundColor: Colors.gray100 },
  videoThumb: { backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  videoTag: { position: 'absolute', bottom: 4, right: 4, backgroundColor: Colors.purple, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  slideInfo: { flex: 1, gap: 4 },
  slideTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  noTitle: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  slideSubtitle: { fontSize: 12, color: Colors.textMuted, lineHeight: 16 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  cardActions: { alignItems: 'center', gap: 8 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
});
