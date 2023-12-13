import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroViagem from './screens/CadastroViagem';
import CadastroLugar from './screens/CadastroLugar';
import ListaLugar from './screens/ListaLugar';
import GaleriaFoto from './screens/GaleriaFoto';
import EditarLugar from './screens/EditarLugar';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='home'>
      <Stack.Screen name='home' component={Home} options={{ title: 'Galeria de Viagens' }} />
      <Stack.Screen name='cadastroviagem' component={CadastroViagem} options={{ title: 'Cadastro de Viagem ' }} />
      <Stack.Screen name='cadastrolugar' component={CadastroLugar} options={{ title: 'Cadastro de Lugares ' }} />
      <Stack.Screen name='listalugar' component={ListaLugar} options={{ title: 'Lista de Lugares ' }} />
      <Stack.Screen name='galeriafoto' component={GaleriaFoto} options={{ title: 'Galeria de Fotos' }} />
      <Stack.Screen name='editarlugar' component={EditarLugar} options={{ title: 'Editar Local' }} />
    </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}