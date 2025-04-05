import {Title} from "@solidjs/meta";
import GitHubSignInButton from "~/components/GitHubSignInButton";
import useAuth from "~/hooks/useAuth";
import {useNavigate} from "@solidjs/router";
import {createEffect} from "solid-js";

export default function Login() {
  const {authState} = useAuth();

  const navigate = useNavigate();

  createEffect(() => {
    const state = authState();
    if(state.logged) {
      navigate("/");
    }
  })

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
