import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar(){
    return <div className="w-full max-w-4xl flex items-center justify-between text-amber-500">
            <h1 className=" text-2xl ">Envoy</h1>
            <ConnectButton/>
    </div>
}