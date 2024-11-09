import {Link, Outlet} from "@remix-run/react";

export default function thingIndex() {

    return (
        <>
            <p>index 1</p>
            <div className="w-full h-full p-5 bg-red-100">
                <div id="sidebar" className="">
                    <p>sidebar</p>
                    <h1>
                        <ul>
                            <li>
                                <Link to={`random`}>
                                    a thing random
                                </Link>
                            </li>
                        </ul>
                    </h1>
                </div>
                <div id="detail">
                    <div>Outlet</div>
                    <Outlet/>
                </div>
            </div>
        </>
    );
}