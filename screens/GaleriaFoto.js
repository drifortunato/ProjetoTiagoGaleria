import { StatusBar } from 'expo-status-bar';
import { Button, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createContext, useEffect, useState } from 'react';
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

    const showAll = () => {
        db.transaction((tx) => {
            tx.executeSql("select foto from fotoimg", [], (trans, results) => {
                alert(JSON.stringify(results.rows._array));
            });
        })
    }

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

    return (
        <SafeAreaView style={styles.container}>
            <ListContext.Provider value={{ setBusy: setBusy, listItemView: listItemView }}>
                <View style={styles.topo}>
                    <Button title='Escolher imagem' onPress={chooseImage} />
                    <SwipeListView
                        data={data}
                        renderItem={({ item }) => listItemView(item)}
                        leftOpenValue={80}
                        rightOpenValue={-72}
                        keyExtractor={item => item.id}
                        style={{ height: "100%" }}
                    />
                    <Button title='Exibir todos' onPress={showAll} />
                </View>
            </ListContext.Provider>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
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

});