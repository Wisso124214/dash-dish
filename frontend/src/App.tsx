import './App.css';
import DetailsOrder from './components/DetailsOrder/DetailsOrder';
import DishList from './components/DishList/DishList';
import Header from './components/Header/Header';
import ThemeProvider from './components/Theme/ThemeProvider';

function App() {
  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        {/* <DetailsOrder /> */}
        <Header />
        <DishList />
      </ThemeProvider>
    </>
  );
}

export default App;
