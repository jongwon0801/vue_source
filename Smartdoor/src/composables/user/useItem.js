// composables/item/useItem.js
import { ref } from "vue";

const itemList = ref([]);
const updatedItem = ref(null);

export function useItem() {
  // displayItems 응답 처리
  function displayItems(data) {
    if (!data?.lists) return;
    itemList.value = data.lists.map((item) => ({
      id: item.item_id,
      name: item.itemObj.name,
      picture: item.itemObj.picture?.url
        ? `https://api.hizib.wikibox.kr/${item.itemObj.picture.url}`
        : "/image/item/default.png",
    }));
  }

  // setItem 응답 처리
  function setItem(item) {
    updatedItem.value = item; // 최신 아이템 저장
  }

  return {
    itemList,
    updatedItem,
    displayItems,
    setItem,
    resetItem,
  };
}
