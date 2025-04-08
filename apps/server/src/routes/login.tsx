import {Title} from "@solidjs/meta";
import GitHubSignInButton from "~/components/GitHubSignInButton";
import useAuth from "~/hooks/useAuth";
import {useSearchParams} from "@solidjs/router";
import {createEffect} from "solid-js";

export default function Login() {
  const [params] = useSearchParams();
  const {authState} = useAuth();

  createEffect(() => {
    const state = authState();
    if(state.logged) {
      window.location.href = params?.redirect as string || "/";
    }
  });

  return (
    <main>
      <Title>Login</Title>
      <div class="flex justify-center h-screen">
        <div class="m-auto">
          <GitHubSignInButton/>
        </div>
      </div>
    </main>
  );
}
