import { ref } from "vue";

const userId = ref(0);
const userList = ref([]);
const isUserDialogOpen = ref(false);
const updatedUser = ref(null); // ✅ 새로 추가

export function useUser() {
  function displayUsers(data) {
    if (!data?.lists) return;
    userList.value = data.lists.map((user) => ({
      id: user.user_id,
      picture: user.userObj.picture?.url
        ? `https://api.hizib.wikibox.kr/${user.userObj.picture.url}`
        : "/image/person/default.png",
      name: user.userObj.name,
    }));
  }

  function selectUser(id) {
    userId.value = id;
    isUserDialogOpen.value = true;
  }

  function resetUser() {
    userId.value = 0;
    isUserDialogOpen.value = false;
  }

  // ✅ 새로 추가: 서버에서 setUser 응답 받을 때 호출
  function setUser(user) {
    updatedUser.value = user; // 상태 저장
  }

  return {
    userId,
    userList,
    isUserDialogOpen,
    updatedUser, // ✅ export
    displayUsers,
    selectUser,
    resetUser,
    setUser, // ✅ export
  };
}
