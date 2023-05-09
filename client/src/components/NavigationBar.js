import React, {useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import Identicon from 'react-hooks-identicons';
import CasperWalletContext from '../contexts/CasperWalletContext';
import AlertContext from '../contexts/AlertContext';

function NavigationBar() {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
    const provider = useContext(CasperWalletContext);
    const currentPath = history.location.pathname;
    const { showAlert } = useContext(AlertContext);

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
    const start = walletAddress.substring(0, 6);
    const end = walletAddress.substring(walletAddress.length - 7);
    const formattedAddress = `${start}...${end}`;

    const handleLogout = async () => {
        try {
            const isConnected = await provider.isConnected();
            if (isConnected) {
                const isDisconnected = await provider.disconnectFromSite();
                if (isDisconnected) {
                    removeItems();
                    history.push('/');
                }
            } else {
                removeItems();
            }
        } catch (error) {
            showAlert("error","Error disconnecting wallet: " + error.message);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full bg-slate-900 ">
            <div className="flex justify-between items-center px-12 py-3 ">
                <div>
                    <Link to="/">
                        <img src={Logo} alt="logo" width="96" />
                    </Link>
                </div>
                <div className="flex space-x-4">
               
                    <Link
                        to="/surveys/new"
                        className={`text-semibold rounded px-4 py-2 hover:scale-125 transition-all duration-200 ease-in-out ${currentPath === "/surveys/new"
                            ? " text-red-500"
                            : "text-red-900"
                            }`}
                    >
                        Create +
                    </Link>
                    <Link
                        to="/surveys"
                        className={`text-semibold rounded px-4 py-2 hover:scale-125 transition-all duration-200 ease-in-out ${currentPath === "/surveys"
                            ? " text-white"
                            : "text-slate-600"
                            }`}
                    >
                        History
                    </Link>


                    <div
                        className=" flex text-slate-600 items-center space-x-2 group cursor-pointer"
                    >
                       
                        <div className="select-none block text-sm font-normal transition-all duration-100 ease-in-out text-slate-200 opacity-80">
                            {formattedAddress}
                        </div>
                        <div className="rounded transition-all duration-200 ease-in-out opacity-80 ">
                            <Identicon className="-translate-y-1 mt-2 bg-slate-200 rounded p-1" string={walletAddress} size={28} />
                        </div>
                        <div className={`absolute right-12 w-40 text-white transition-all duration-500 ease-in-out  opacity-0 group-hover:opacity-100 }`}>
                            <button
                                onClick={handleLogout}
                                className="select-none w-full rounded py-1 bg-slate-800 text-semibold"
                            >
                                Disconnect
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default NavigationBar;