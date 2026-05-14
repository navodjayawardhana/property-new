/**
 * News Articles management screen.
 *
 * Lists all articles with search (debounced 400ms) and publish-status filter.
 * Pagination — 20 articles per page.
 *
 * Create / Edit via an in-screen modal (no separate route needed):
 *   - Fields: title, excerpt, category, tag, read_time, cover image, publish toggle
 *   - Images picked from gallery via expo-image-picker (16:9 crop enforced)
 *   - Only JPEG, PNG, WEBP accepted
 *   - POST /admin/news to create, PATCH /admin/news/:id to update
 *
 * Per-article actions:
 *   - Toggle published/draft → PATCH /admin/news/:id  { is_published }
 *   - Edit                   → opens the modal pre-filled
 *   - Delete                 → DELETE /admin/news/:id (with confirmation modal)
 *
 * Submit flow mirrors add-property: validate required fields → check optional
 * fields → show "Submit anyway?" modal → call API.
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/Badge';
import { CustomSwitch } from '@/components/CustomSwitch';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';
import { ScreenLoader } from '@/components/ScreenLoader';
import { BadgeColors, Colors } from '@/constants/Colors';
import { friendlyError, toast } from '@/lib/alert';
import { adminNews } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { NewsArticle } from '@/lib/types';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Published', value: '1' },
  { label: 'Draft', value: '0' },
];

const CATEGORIES = [
  'News', 'Buying & Building', 'Finance', 'Renting', 'Guides', 'Lifestyle', 'Insights',
];

type ArticleForm = {
  title: string;
  excerpt: string;
  category: string;
  tag: string;
  read_time: string;
  is_published: boolean;
  imageUri: string | null;
};

const emptyForm = (): ArticleForm => ({
  title: '', excerpt: '', category: CATEGORIES[0], tag: '', read_time: '5 min', is_published: false, imageUri: null,
});

export default function NewsScreen() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Set<string>>(new Set());
  const [optionalWarning, setOptionalWarning] = useState<string[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p = 1, s = search, pub = statusFilter) => {
      if (!token) return;
      try {
        const res = await adminNews.list(token, { search: s, is_published: pub, page: p });
        setArticles(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
        setPage(res.current_page);
      } catch (err) {
        toast.error('Failed to Load Articles', friendlyError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, search, statusFilter]
  );

  useEffect(() => { load(); }, []);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, text, statusFilter), 400);
  };

  const onStatusFilter = (v: string) => { setStatusFilter(v); load(1, search, v); };
  const onPageChange = (p: number) => load(p, search, statusFilter);
  const onRefresh = () => { setRefreshing(true); load(1, search, statusFilter); };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors(new Set());
    setOptionalWarning([]);
    setModalVisible(true);
  };

  const openEdit = (a: NewsArticle) => {
    setEditTarget(a);
    setForm({ title: a.title, excerpt: a.excerpt, category: a.category, tag: a.tag ?? '', read_time: a.read_time, is_published: a.is_published, imageUri: null });
    setFormErrors(new Set());
    setOptionalWarning([]);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (asset.mimeType && !ALLOWED.includes(asset.mimeType)) {
        toast.warning('Unsupported Format', 'Only JPG, PNG, and WEBP images are accepted.');
        return;
      }
      setForm((f) => ({ ...f, imageUri: asset.uri }));
    }
  };

  const doSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('excerpt', form.excerpt.trim());
      fd.append('category', form.category);
      fd.append('tag', form.tag.trim());
      fd.append('read_time', form.read_time.trim());
      fd.append('is_published', form.is_published ? '1' : '0');
      if (form.imageUri) {
        const ext = form.imageUri.split('.').pop() ?? 'jpg';
        fd.append('image', { uri: form.imageUri, name: `article.${ext}`, type: `image/${ext}` } as unknown as Blob);
      }
      if (editTarget) {
        const updated = await adminNews.update(token, editTarget.id, fd);
        setArticles((prev) => prev.map((a) => (a.id === editTarget.id ? updated : a)));
      } else {
        await adminNews.create(token, fd);
        load(1, search, statusFilter);
      }
      setModalVisible(false);
    } catch (err) {
      toast.error('Save Failed', friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm());
    setFormErrors(new Set());
    setOptionalWarning([]);
  };

  const handleSave = () => {
    const errs = new Set<string>();
    if (!form.title.trim() || form.title.trim().length > 255) errs.add('title');
    if (!form.excerpt.trim() || form.excerpt.trim().length > 1000) errs.add('excerpt');
    setFormErrors(errs);
    if (errs.size > 0) return;

    if (form.tag.trim().length > 50) {
      toast.warning('Validation', 'Tag must be 50 characters or fewer.');
      return;
    }
    if (form.read_time.trim().length > 20) {
      toast.warning('Validation', 'Read time must be 20 characters or fewer.');
      return;
    }

    const missing: string[] = [];
    const hasImage = !!form.imageUri || !!editTarget?.image_url;
    if (!hasImage) missing.push('Article Image');
    if (!form.tag.trim()) missing.push('Tag');
    if (missing.length > 0) { setOptionalWarning(missing); return; }
    doSave();
  };

  const handleTogglePublish = async (a: NewsArticle) => {
    if (!token) return;
    try {
      const updated = await adminNews.update(token, a.id, { is_published: !a.is_published });
      setArticles((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (err) {
      toast.error('Update Failed', friendlyError(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleteLoading(true);
    try {
      await adminNews.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      load(page, search, statusFilter);
    } catch (err) {
      toast.error('Delete Failed', friendlyError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  function formatDate(d?: string | null) {
    if (!d) return 'Draft';
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderItem = ({ item }: { item: NewsArticle }) => {
    const sc = item.is_published ? BadgeColors.newsStatus.published : BadgeColors.newsStatus.draft;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Image source={{ uri: item.image_url }} style={styles.thumb} />
          <View style={styles.cardInfo}>
            <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Badge label={item.category} bg={Colors.primaryLight} color={Colors.primary} />
              {item.tag && <Badge label={item.tag} bg={Colors.gray100} color={Colors.gray600} />}
            </View>
            <Text style={styles.articleMeta}>
              <Ionicons name="time-outline" size={11} color={Colors.textLight} /> {item.read_time} · {formatDate(item.published_at)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.publishRow}>
            <Badge label={item.is_published ? 'Published' : 'Draft'} bg={sc.bg} color={sc.text} />
            <CustomSwitch
              value={item.is_published}
              onValueChange={() => handleTogglePublish(item)}
              size="sm"
            />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
              <Ionicons name="pencil-outline" size={15} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={15} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarRow}>
          <View style={styles.searchFlex}>
            <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search articles..." />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add News</Text>
          </TouchableOpacity>
        </View>
        <FilterChips options={STATUS_FILTERS} selected={statusFilter} onSelect={onStatusFilter} />
        <Text style={styles.countText}>{total} article{total !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ScreenLoader message="Loading articles…" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(a) => String(a.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={<EmptyState icon="newspaper-outline" title="No articles found" />}
          ListFooterComponent={<Pagination currentPage={page} lastPage={lastPage} total={total} perPage={5} onPageChange={onPageChange} />}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetIconBtn} onPress={() => setResetConfirm(true)}>
                  <Ionicons name="refresh-outline" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{editTarget ? 'Edit Article' : 'New Article'}</Text>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Image */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
                ) : editTarget?.image_url ? (
                  <Image source={{ uri: editTarget.image_url }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={32} color={Colors.textLight} />
                    <Text style={styles.imagePlaceholderText}>Tap to add article image</Text>
                  </View>
                )}
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, formErrors.has('title') && styles.fieldLabelError]}>Title *</Text>
                <TextInput
                  style={[styles.input, formErrors.has('title') && styles.inputError]}
                  value={form.title}
                  onChangeText={(t) => { setForm((f) => ({ ...f, title: t })); setFormErrors((p) => { const n = new Set(p); n.delete('title'); return n; }); }}
                  placeholder="Article title"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              {/* Excerpt */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, formErrors.has('excerpt') && styles.fieldLabelError]}>Excerpt *</Text>
                <TextInput
                  style={[styles.input, styles.textarea, formErrors.has('excerpt') && styles.inputError]}
                  value={form.excerpt}
                  onChangeText={(t) => { setForm((f) => ({ ...f, excerpt: t })); setFormErrors((p) => { const n = new Set(p); n.delete('excerpt'); return n; }); }}
                  placeholder="Short description..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Category */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TouchableOpacity style={styles.input} onPress={() => setCategoryOpen(true)}>
                  <Text style={styles.selectText}>{form.category}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Tag */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tag (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={form.tag}
                  onChangeText={(t) => setForm((f) => ({ ...f, tag: t }))}
                  placeholder="e.g. First Home Buyer"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              {/* Read Time */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Read Time</Text>
                <TextInput
                  style={styles.input}
                  value={form.read_time}
                  onChangeText={(t) => setForm((f) => ({ ...f, read_time: t }))}
                  placeholder="e.g. 5 min read"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              {/* Publish toggle */}
              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Publish Now</Text>
                <CustomSwitch
                  value={form.is_published}
                  onValueChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                  size="md"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Category picker */}
        <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setCategoryOpen(false)}>
            <View style={styles.catOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.catMenu}>
                  <Text style={styles.catTitle}>Select Category</Text>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} style={[styles.catOption, form.category === c && styles.catOptionActive]} onPress={() => { setForm((f) => ({ ...f, category: c })); setCategoryOpen(false); }}>
                      <Text style={[styles.catText, form.category === c && styles.catTextActive]}>{c}</Text>
                      {form.category === c && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Article"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        visible={optionalWarning.length > 0}
        title="Some fields are empty"
        message={`These optional fields are empty:\n• ${optionalWarning.join('\n• ')}\n\nSubmit anyway?`}
        confirmLabel="Submit"
        confirmColor={Colors.primary}
        onConfirm={() => { setOptionalWarning([]); doSave(); }}
        onCancel={() => setOptionalWarning([])}
      />
      <ConfirmModal
        visible={resetConfirm}
        title="Reset Form"
        message="All entered data will be cleared. Continue?"
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
  toolbar: { paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  toolbarRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchFlex: { flex: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  countText: { fontSize: 12, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10 },
  thumb: { width: 80, height: 64, borderRadius: 10, resizeMode: 'cover', backgroundColor: Colors.gray100 },
  cardInfo: { flex: 1, gap: 5 },
  articleTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  articleMeta: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: Colors.borderLight },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  publishRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnRow: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resetIconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray100 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.primary, minWidth: 64, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  modalBody: { flex: 1 },
  modalContent: { padding: 16, gap: 14, paddingBottom: 48 },
  imagePicker: { borderRadius: 14, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: 180, resizeMode: 'cover' },
  imagePlaceholder: { height: 160, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gray50 },
  imagePlaceholderText: { fontSize: 13, color: Colors.textLight },
  imageOverlay: { position: 'absolute', bottom: 10, right: 10, width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldLabelError: { color: Colors.danger },
  inputError: { borderColor: Colors.danger },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textarea: { minHeight: 80 },
  selectText: { fontSize: 14, color: Colors.text, flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  // Category picker
  catOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  catMenu: { backgroundColor: Colors.card, borderRadius: 16, padding: 8, width: '100%', maxWidth: 340, maxHeight: 400 },
  catTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, paddingHorizontal: 12, paddingVertical: 8 },
  catOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10 },
  catOptionActive: { backgroundColor: Colors.primaryLight },
  catText: { fontSize: 14, color: Colors.text },
  catTextActive: { color: Colors.primary, fontWeight: '600' },
});
