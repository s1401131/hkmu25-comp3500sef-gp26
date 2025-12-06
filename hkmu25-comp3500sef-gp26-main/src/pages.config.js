import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderReceipt from './pages/OrderReceipt';
import Restaurant from './pages/Restaurant';
import LanguageSelection from './pages/LanguageSelection';
import OrderDetail from './pages/OrderDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Checkout": Checkout,
    "OrderReceipt": OrderReceipt,
    "Restaurant": Restaurant,
    "LanguageSelection": LanguageSelection,
    "OrderDetail": OrderDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};