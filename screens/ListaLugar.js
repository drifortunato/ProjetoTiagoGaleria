import { useRoute } from "@react-navigation/native";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Button, Image, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite';
import { SwipeListView } from "react-native-swipe-list-view";

const db = SQLite.openDatabase("local.db");
const ListContext = createContext(null);

export default function ListaLugar({ navigation, route }) {

    const [update, setUpdate] = useState(true);
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [idviagem, setIdviagem] = useState(route.params?.id);

    useEffect(() => {
        setIdviagem(route.params?.id);
    }, [idviagem]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql("create table if not exists local (id integer primary key not null, nome text not null, descricao text not null, data text not null, idviagem integer not null)");
        });
    }, []);

    let [flatListItems, setFlatListItems] = useState([]);

    useEffect(() => {
        if (update || route.params?.atualizar) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM local WHERE IDVIAGEM = (?)', [idviagem],
                    (tx, results) => {
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
    }, [update, route]);

    let listItemView = (item, rowMap) => {
        return (
            <View
                key={item.id}
                style={{ backgroundColor: 'white', padding: 25, width: "100%" }}>
                <Pressable style={({ pressed }) => [
                    {
                        backgroundColor: pressed ? "#ccc" : "#fff",
                    },
                    styles.itemDestaque,
                ]}
                    onPress={() => navigation.navigate('galeriafoto', { idlugar: item.id })}
                >
                    <View style={{ width: "100%" }}>
                        <Text style={styles.baseText}>
                            Lugar :
                            <Text style={styles.innerText}> {item.nome}</Text>
                        </Text>
                        <Text style={styles.baseText}>
                        Detalhes :
                            <Text style={styles.innerText}> {item.descricao}</Text>
                        </Text>
                        <Text style={styles.baseText}>
                            Data :
                            <Text style={styles.innerText}> {item.data}</Text>
                        </Text>                        
                    </View>
                </Pressable>
            </View >
        );
    };

    const BackitemLista = (data, rowMap) => (
        <View style={styles.itemFundo}>
            <DelButton data={data} rowMap={rowMap} />
            <Button title="Editar" style={{ right: 0 }} color="steelblue" />
        </View>
    );

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const onRefresh = () => {
        setUpdate(true);
    };


    //  <Button title="Cadastrar" status={{ left: 0 }} color="crimson" onPress={
    //      () => navigation.navigate('cadastrolugar', { idV: idviagem })
    //  } />

    const Cadastrar = ({ data, rowMap }) => {
        const context = useContext(ListContext);
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('cadastrolugar', { idV: idviagem })}
                style={styles.touchableOpacityStyle}>
                <Image
                    source={{
                        uri:
                            'https://developerplus.com.br/wp-content/uploads/2021/12/plus_icon.png',
                    }}
                    style={styles.floatingButtonStyle}
                />
            </TouchableOpacity>
        )
    }

    const DelButton = ({ data, rowMap }) => {
        const context = useContext(ListContext);
        return (
            <Button title="Excluir" status={{ left: 0 }} color="crimson" onPress={() => {
                Alert.alert(
                    'Excluir Lugar',
                    'Deseja realmente excluir este Lugar ?',
                    [
                        {
                            text: "Não", style: 'cancel',
                            onPress: () => { }
                        },
                        {
                            text: 'Sim', style: 'destructive',
                            onPress: () => {
                                db.transaction((tx) => {
                                    tx.executeSql("delete from local where id = (?)", [data.item.id]);
                                });
                                closeRow(rowMap, data.item.id);
                                setUpdate(true);
                            }
                        }
                    ]
                );
            }} />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ListContext.Provider value={{ setBusy: setBusy, listItemView: listItemView, navigation: navigation }}>
                <View style={styles.topo}>
                    <SwipeListView
                        data={data}
                        renderItem={({ item }) => listItemView(item)}
                        renderHiddenItem={BackitemLista}
                        leftOpenValue={80}
                        rightOpenValue={-72}
                        keyExtractor={item => item.id}
                        style={{ height: "100%" }}
                        refreshControl={
                            <RefreshControl
                                refreshing={busy}
                                onRefresh={onRefresh} />
                        }
                    />
                    <Cadastrar />
                </View>

            </ListContext.Provider>
        </SafeAreaView>

    )

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2728D',
        alignItems: 'center',
        padding: 10,
        flex: 1,
        justifyContent: 'center',
    },
    titleStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
    },
    textStyle: {
        fontSize: 16,
        textAlign: 'center',
        padding: 10,
    },
    touchableOpacityStyle: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 70,
        height: 70,
    },
    topo: {
        marginTop: 10,
        width: "100%"
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
    itemDestaque: {
        alignItems: 'flex-start',
        borderBottomColor: '#ccc',
        justifyContent: 'center',
        height: 60,
        paddingLeft: 10,
    },
    baseText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    innerText: {
        color: 'red',
    },
});