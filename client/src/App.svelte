<script>
  import router from "page";
  import Home from "./pages/Home.svelte";
  import SignIn from "./pages/SignIn.svelte";
  import Register from "./pages/Register.svelte";

  import Header from "./components/header/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import ErrorMessage from "./components/utils/error-handling/ErrorMessage.svelte";
  import {refreshAccessToken} from "./components/utils/js/fetch-calls/fetch-wrapper.js";
  import PersonalDetails from "./pages/PersonalDetails.svelte";
  import Users from "./pages/Users.svelte";
  import AccountDisabled from "./pages/AccountDisabled.svelte";
  import {jwtDecode} from "jwt-decode";
  import UserReservations from "./pages/UserReservations.svelte";
  import {onMount} from "svelte";
  import {getCurrentUser} from "./components/utils/js/jwt-utils.js";


  let currentRoute = $state("/");
  let Page = $state();
  let context = $state({});

  const refreshToken = async () => {
      try {
          return await refreshAccessToken();
      } catch (e) {
          console.error(e);
      }
  }

  router('/', async (ctx) => {
      Page = Home;
      currentRoute = ctx.pathname;
  })

  router('/sign-in', async (ctx) => {
      Page = SignIn;
      currentRoute = ctx.pathname;
  })

  router('/register', async (ctx) => {
      Page = Register;
      currentRoute = ctx.pathname;
  })

  router('/users/:id', async (ctx) => {
      Page = PersonalDetails;
      currentRoute = ctx.pathname;
  })

  router('/users', async (ctx) => {
      Page = Users;
      currentRoute = ctx.pathname;
  })

  router('/users/:id/reservations', async (ctx) => {
      Page = UserReservations;
      currentRoute = ctx.pathname;
  })

  onMount(async () => {
      await refreshToken();
      context = getCurrentUser();
  })

  router.start();
</script>

{#await refreshToken()}
    <p>Loading...</p>
{:then token}
    {#if token && jwtDecode(token).isAccountDisabled}
        <AccountDisabled />
    {:else}
        <Header active={currentRoute} />
        <Page {context} />
        <Footer />
    {/if}
{/await}
<ErrorMessage />
