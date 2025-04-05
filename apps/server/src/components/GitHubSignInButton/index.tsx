import GitHubLogo from "./github.svg";
import useAuth from "~/hooks/useAuth";

export default function GitHubSignInButton() {
  const {signInWithGitHub} = useAuth();

  return (
    <button class={"bg-[#1B1F23] text-white flex flex-row items-center p-3 cursor-pointer rounded hover:bg-[#0b0c0e]"} onClick={signInWithGitHub}>
      <img src={GitHubLogo} width={30} height={30} alt={"GitHub"}/>
      <span class={"pl-2"}>Sign in with GitHub</span>
    </button>
  )
};