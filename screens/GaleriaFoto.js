import { StatusBar } from 'expo-status-bar';
import { Alert, Button, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createContext, useContext, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import * as SQLite from 'expo-sqlite';
import { SwipeListView } from 'react-native-swipe-list-view';

const db = SQLite.openDatabase("fotoimg.db");
const ListContext = createContext(null);

export default function GaleriaFoto({ navigation, route }) {
    const [imagem, setImagem] = useState(null);
    const [idfoto, setIdfoto] = useState(route.params?.idlugar);
    const [update, setUpdate] = useState(true);
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState(null);
    const [salvar, setSalvar] = useState(false);

    let [flatListItems, setFlatListItems] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql("create table if not exists fotoimg (id integer primary key not null, idlocal integer null, foto text not null)");
        });
    }, []);

    useEffect(() => {
        //alert(idfoto)
        setIdfoto(route.params?.idlugar);
    }, [idfoto]);

    useEffect(() => {
        if (update) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM FOTOIMG WHERE IDLOCAL = (?)', [idfoto], (tx, results) => {
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i)
                            temp.push(results.rows.item(i));
                        setFlatListItems(temp);
                        setData(temp);
                    }
                );
            });
            setUpdate(false);
        }
    }, [update]);

    let listItemView = (item, rowMap) => {
        return (
            <View
                key={item.id}
                style={{ backgroundColor: 'white', padding: 15, width: "100%" }}>
                <Pressable style={({ pressed }) => [
                    {
                        backgroundColor: pressed ? "#ccc" : "#fff",
                    },
                    styles.itemDestaque,
                ]}
                //onPress={() => navigation.navigate('listalugar', { id: item.id })}
                >
                    <View style={styles.imagemContainer}>
                        {item.foto === null ? null : <Image style={styles.imagem} source={item.foto} />}
                    </View>
                </Pressable>
            </View >
        );
    };

    const addFoto = () => {
        db.transaction((tx) => {
            tx.executeSql("insert into fotoimg (idlocal,foto) values (?,?)", [idfoto, imagem], (tx, results) => {
                if (results.rows._array.length > 0) {
                    alert('ERROR.')
                }
                else {
                }
            });
        })
    }

    const chooseImage = async () => {
        let escolha = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            allowsMultipleSelection: false,
            aspect: [16, 9],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1
        });
        if (!escolha.canceled) {
            setImagem(escolha.assets[0].uri);
            setSalvar(true);
        }
    }

    useEffect(() => {
        if (salvar) {
            addFoto();
            onRefresh();
            setSalvar(false);
        }
    }, [salvar]);


    const onRefresh = () => {
        setUpdate(true);
    };

    const BackitemLista = (data, rowMap) => (
        <View style={styles.itemFundo}>
            <DelButton data={data} rowMap={rowMap} />
        </View>
    );

    const DelButton = ({ data, rowMap }) => {
        const context = useContext(ListContext);
        return (
            <TouchableOpacity
                style={[styles.rightAction, { backgroundColor: 'red' }]}
                onPress={() => {
                    Alert.alert(
                        'Excluir foto',
                        'Deseja realmente excluir esta Foto ?',
                        [
                            {
                                text: "Não", style: 'cancel',
                                onPress: () => { }
                            },
                            {
                                text: 'Sim', style: 'destructive',
                                onPress: () => {
                                    db.transaction((tx) => {
                                        tx.executeSql("delete from fotoimg where id = (?)", [data.item.id]);
                                    });
                                    onRefresh();
                                }
                            }
                        ]
                    );
                }}
            >
                <Image
                    source={require('./tash.png')}
                    style={{ width: 60, height: 60 }}
                />
            </TouchableOpacity>
        )
    }

//  <Button title='Carregar imagem' color="#2196F3" mode="contained" onPress={chooseImage} />

    return (
        <SafeAreaView style={styles.container}>
            <ListContext.Provider value={{ setBusy: setBusy, listItemView: listItemView }}>
                <View style={styles.topo}>
                    <TouchableOpacity style={styles.btnCadastro} onPress={chooseImage}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                        Carregar imagem
                        </Text>
                    </TouchableOpacity>                  
                    <SwipeListView
                        data={data}
                        renderItem={({ item }) => listItemView(item)}
                        renderHiddenItem={BackitemLista}
                        leftOpenValue={80}
                        rightOpenValue={-72}
                        keyExtractor={item => item.id}
                        style={{ height: "100%" }}
                    />
                </View>
            </ListContext.Provider>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2728D',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    imagemContainer: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagem: {
        marginTop: 20,
        width: 320,
        height: 180,
    },
    topo: {
        marginTop: 20,
        width: "100%",
    },
    itemFundo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    btnCadastro: {
        width: '100%',
        height: 40,
        backgroundColor: '#7b42f5',
        borderRadius: 20,
        justifyContent: 'center'
    },    
});