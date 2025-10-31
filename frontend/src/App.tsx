import './App.css';
import DishList from './components/DishList/DishList';
import ThemeProvider from './components/Theme/ThemeProvider';

function App() {
  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <DishList />
      </ThemeProvider>
    </>
  );
}

export default App;
