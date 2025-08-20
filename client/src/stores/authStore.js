// import { create } from "zustand";
// import { devtools, persist } from "zustand/middleware";

// const useAuthStore = create(
//   persist(
//     devtools((set) => ({
//       user: null,
//       token: null,
//       isLoggedIn: false,

//       login: (userData, token) =>
//         set(
//           { user: userData, token, isLoggedIn: true },
//           false,
//           "auth/login"
//         ),

//       logout: () =>
//         set(
//           { user: null, token: null, isLoggedIn: false },
//           false,
//           "auth/logout"
//         ),
//     })),
//     {
//       name: "auth-storage",
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token,
//         isLoggedIn: state.isLoggedIn,
//       }),
//     }
//   )
// );

// export default useAuthStore;
// stores/authStore.js
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";

// const useAuthStore = create(
//   devtools(
//     (set) => {
//       const token = localStorage.getItem("token");
//       const user = localStorage.getItem("user");

//       return {
//         user: user ? JSON.parse(user) : null,
//         token: token || null,
//         isLoggedIn: !!token,

//         login: (userData, token) => {
//           localStorage.setItem("token", token);
//           localStorage.setItem("user", JSON.stringify(userData));

//           set(
//             { user: userData, token, isLoggedIn: true },
//             false,
//             "auth/login"
//           );
//         },

//         logout: () => {
//           localStorage.removeItem("token");
//           localStorage.removeItem("user");

//           set(
//             { user: null, token: null, isLoggedIn: false },
//             false,
//             "auth/logout"
//           );
//         },
//       };
//     },
//     { name: "AuthStore" }
//   )
// );

// export default useAuthStore;
// stores/authStore.js
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";

// const useAuthStore = create(
//   devtools(
//     (set) => ({
//       user: null,
//       token: null,
//       isLoggedIn: false,

//       login: (userData, token) => {
//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(userData));

//         set(
//           { user: userData, token, isLoggedIn: true },
//           false,
//           "auth/login"
//         );
//       },

//       logout: () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         set(
//           { user: null, token: null, isLoggedIn: false },
//           false,
//           "auth/logout"
//         );
//       },
//     }),
//     { name: "AuthStore" }
//   )
// );

// export default useAuthStore;
// store/useAuthStore.js
// import { create } from 'zustand';
// import { persist, devtools } from 'zustand/middleware';

// const useAuthStore = create(
//   persist(
//     devtools(
//       (set) => ({
//         user: null,
//         token: null,
//         isLoggedIn: false,
//         error: null,
//         loading: false,
//         _hasHydrated: false, // ✅ สำหรับเช็คว่า hydrate เสร็จหรือยัง

//         setLoading: (loading) => set({ loading }),
//         setError: (error) => set({ error }),

//         login: (userData, token) => {
//           try {
//             set({
//               user: userData,
//               token,
//               isLoggedIn: true,
//               error: null,
//             });
//           } catch (err) {
//             set({ error: err.message || 'Login failed' });
//             throw err;
//           }
//         },

//         logout: () => {
//           try {
//             set({
//               user: null,
//               token: null,
//               isLoggedIn: false,
//               error: null,
//               loading: false,
//             });
//           } catch (err) {
//             set({ error: err.message || 'Logout failed' });
//           }
//         },

//         setHasHydrated: (value) => set({ _hasHydrated: value }),
//       }),
//       { name: 'AuthStore' }
//     ),
//     {
//       name: 'auth-storage',
//       getStorage: () => localStorage,
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token,
//         isLoggedIn: state.isLoggedIn,
//       }),
//       onRehydrateStorage: () => (state) => {
//         state.setHasHydrated(true);
//         if (state.token && state.user) {
//           state.isLoggedIn = true;
//         }
//       },
//     }
//   )
// );

// export default useAuthStore;
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    devtools(
      (set) => ({
        user: null,
        token: null,
        role: null,           // ✅ เพิ่ม role แยกต่างหาก
        isLoggedIn: false,
        error: null,
        loading: false,
        _hasHydrated: false,

        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        login: (userData, token) => {
          try {
            set({
              user: userData,
              token,
              role: userData.role || null,  // ✅ ดึง role จาก userData
              isLoggedIn: true,
              error: null,
            });
          } catch (err) {
            set({ error: err.message || 'Login failed' });
            throw err;
          }
        },

        logout: () => {
          try {
            set({
              user: null,
              token: null,
              role: null,             // ✅ ล้าง role เมื่อ logout
              isLoggedIn: false,
              error: null,
              loading: false,
            });
          } catch (err) {
            set({ error: err.message || 'Logout failed' });
          }
        },

        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      { name: 'AuthStore' }
    ),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,              // ✅ บันทึก role ด้วย
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
        if (state.token && state.user) {
          state.isLoggedIn = true;
        }
      },
    }
  )
);

export default useAuthStore;

// stores/authStore.js

