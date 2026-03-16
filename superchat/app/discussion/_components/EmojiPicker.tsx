import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Données ──────────────────────────────────────────────────────────────────
const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: 'Récents',
    icon: '🕐',
    emojis: ['😀','😂','❤️','👍','🙏','😍','🔥','✅','😭','🎉','💯','🥰'],
  },
  {
    label: 'Smileys',
    icon: '😀',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃',
      '😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜',
      '🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔',
      '😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤',
      '😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓',
      '🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦',
      '😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮',
      '🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','💀','☠️',
    ],
  },
  {
    label: 'Gestes',
    icon: '👋',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘',
      '🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾',
    ],
  },
  {
    label: 'Cœurs',
    icon: '❤️',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕',
      '💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','🕉️','🔯',
    ],
  },
  {
    label: 'Animaux',
    icon: '🐶',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮',
      '🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅',
      '🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜',
    ],
  },
  {
    label: 'Nourriture',
    icon: '🍕',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥',
      '🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🧄','🧅','🥔',
      '🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇',
      '🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆',
      '🌮','🌯','🫔','🥗','🥘','🫕','🍝','🍜','🍲','🍛','🍣','🍱',
      '🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂',
    ],
  },
  {
    label: 'Voyage',
    icon: '✈️',
    emojis: [
      '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚',
      '🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽',
      '🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🚤','🛥️','🛳️','⛴️',
      '🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️',
    ],
  },
  {
    label: 'Objets',
    icon: '💡',
    emojis: [
      '⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀',
      '📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻',
      '🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦',
      '🕯️','🪔','🧯','🛢️','💰','💴','💵','💶','💷','💸','💳','🪙',
    ],
  },
  {
    label: 'Symboles',
    icon: '🔣',
    emojis: [
      '✅','❌','❎','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤',
      '🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳','⬛','⬜',
      '▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪',
      '⁉️','‼️','❓','❔','❕','❗','🔅','🔆','🔱','⚜️','🔰','♻️',
      '✔️','🔛','🔜','🔝','🆗','🆙','🆒','🆕','🆓','🔟','🔠','🔡',
    ],
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const NUM_COLS = 8;

export default function EmojiPicker({ visible, onClose, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  const currentEmojis = search.trim()
    ? CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search))
    : CATEGORIES[activeCategory].emojis;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Barre de recherche */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un emoji…"
            placeholderTextColor="#AAAAAA"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>

        {/* Onglets catégories */}
        {!search && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.tab, activeCategory === i && styles.tabActive]}
                onPress={() => setActiveCategory(i)}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Grille d'emojis */}
        <FlatList
          data={currentEmojis}
          keyExtractor={(item, i) => `${item}-${i}`}
          numColumns={NUM_COLS}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.emojiCell} onPress={() => onSelect(item)}>
              <Text style={styles.emoji}>{item}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun emoji trouvé</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '55%',
    paddingTop: 8,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#DDDDE0',
    alignSelf: 'center', marginBottom: 10,
  },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F0F5', borderRadius: 12,
    marginHorizontal: 12, marginBottom: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111', padding: 0 },

  tabs: { paddingHorizontal: 12, gap: 4, paddingBottom: 8 },
  tab: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: { backgroundColor: '#25D36620' },
  tabIcon: { fontSize: 20 },

  grid: { paddingHorizontal: 8, paddingBottom: 20 },
  emojiCell: {
    flex: 1, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 8,
  },
  emoji: { fontSize: 26 },

  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { color: '#AAAAAA', fontSize: 14 },
});
