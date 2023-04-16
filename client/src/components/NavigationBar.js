import React, { useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import Identicon from 'react-hooks-identicons';
import CasperWalletContext from './CasperWalletContext';



function NavigationBar() {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
    const provider = useContext(CasperWalletContext);
    const currentPath = history.location.pathname

    function removeItems() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('active_public_key');
        localStorage.removeItem('user_already_signed');
        localStorage.removeItem('x_casper_provided_signature');
        localStorage.removeItem('user_is_activated');
    }

    useEffect(() => {
        if (!isWalletConnected) {
            history.push('/');
        }
    }, [isWalletConnected, history]);

    useEffect(() => {
        const handleDisconnect = (event) => {
            try {
                const state = JSON.parse(event.detail);
                if (!state.isConnected) {
                    removeItems();
                    history.push('/');
                }
            } catch (error) {
                console.error("Error handling disconnect event: " + error.message);
            }
        };

        const CasperWalletEventTypes = window.CasperWalletEventTypes;
        window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
        window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);

        return () => {
            window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
            window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
        };
    }, [history]);


    if (!token) {
        history.push('/login');
        return null;
    }

    const walletAddress = localStorage.getItem('active_public_key');
    const start = walletAddress.substring(0, 4);
    const end = walletAddress.substring(walletAddress.length - 4);
    const formattedAddress = `${start}...${end}`;

    const handleLogout = async () => {
        try {
            const isConnected = await provider.isConnected();
            if (isConnected) {
                // Attempt to disconnect from the wallet
                const isDisconnected = await provider.disconnectFromSite();
                if (isDisconnected) {
                    removeItems();
                    history.push('/');
                }
            } else {
                removeItems();
            }
        } catch (error) {
            console.error("Error disconnecting wallet: " + error.message);
        }
    };

    return (
        <div className="select-none font-bold">
            <div className="h-screen flex-col flex justify-between">
                <div name="logo" className=" h-36 w-44 flex justify-center items-center p-8">
                    <Link to="/">
                        <img src={Logo} alt="logo" width="512px" />
                    </Link>
                </div>
                <div name="menu" className="flex flex-col  space-y-3 translate-x-8">
                    <div className={`h-16 text-xl rounded drop-shadow-lg items-center outline-none ${currentPath === "/surveys/new" ? "bg-slate-800 text-red-400 outline-red-500" : "bg-slate-700 text-slate-300" }`}>
                        <Link to="/surveys/new">
                            <div className="h-full flex items-center ml-8 ">
                                Create +
                            </div>
                        </Link>
                    </div>
                    <div className={`h-16 text-xl rounded drop-shadow-lg items-center outline-none ${currentPath === "/surveys" ? "bg-slate-800 text-white outline-red-500" : "bg-slate-700 text-slate-300"}`}>
                        <Link to="/surveys">
                            <div className={`h-full flex items-center ml-8 `}>
                                History
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="card absolute right-3 top-7 p-2 h-24 justify-end">
                    <div className="grid grid-rows-3 grid-flow-col gap-2">
                        
                        <div className="rounded drop-shadow-lg col-span-2 bg-slate-600 flex justify-center px-1 items-center break-all text-slate-300 text-sm font-normal">
                            {formattedAddress}
                        </div>
                        <button onClick={handleLogout} className="rounded drop-shadow-lg row-span-2 col-span-2 text-red-500 bg-slate-900 flex justify-center font-semibold items-center">
                            Logout
                        </button>
                        <div className=" rounded drop-shadow-lg row-span-3 bg-slate-200 flex justify-center items-center">
                            <Identicon string={walletAddress} size={50} />
                        </div>
                    </div>
                </div>
                <div className="h-2 w-full">

                </div>
            </div>
        </div>
    );
}

export default NavigationBar;
