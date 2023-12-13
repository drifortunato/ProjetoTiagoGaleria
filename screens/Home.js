import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Image, TouchableOpacity, Text, FlatList, Button, Alert, RefreshControl, Pressable, } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SQLite from 'expo-sqlite';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useRoute } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

const Stack = createNativeStackNavigator();
const ListContext = createContext(null);
const db = SQLite.openDatabase("viagem.db");


export default function Home({ navigation }) {
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [update, setUpdate] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const route = useRoute();
    const listProvider = useContext(ListContext);
    const [autenticado, setAutenticado] = useState(false);


    const autenticar = async () => {
        const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Por favor, realize a autenticação.'
        });
        setAutenticado(auth.success);
    }

    useEffect(() => {
        // autenticar(),
        db.transaction((tx) => {
            tx.executeSql("create table if not exists viagem (id integer primary key not null, nome text not null, inicio text not null, fim text not null)");
        });
    }, []);

    let [flatListItems, setFlatListItems] = useState([]);

    useEffect(() => {
        if (update || route.params?.atualizar || autenticado) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM VIAGEM',
                    [],
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
    }, [update, route, autenticado]);

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
                    onPress={() => navigation.navigate('listalugar', { id: item.id })}
                >
                    <View style={{ width: "100%" }}>
                        <Text style={styles.baseText}>
                            Viagem :
                            <Text style={styles.innerText}> {item.nome}</Text>
                        </Text>
                        <Text style={styles.textStyle}>Inicio : {item.inicio}   Fim : {item.fim}</Text>
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

    const DelButton = ({ data, rowMap }) => {
        const context = useContext(ListContext);
        return (
            <TouchableOpacity
                style={[styles.rightAction, { backgroundColor: 'red' }]}
                onPress={() => {
                    Alert.alert(
                        'Excluir viagem ',
                        'Deseja realmente excluir esta Viagem ?',
                        [
                            {
                                text: "Não", style: 'cancel',
                                onPress: () => { }
                            },
                            {
                                text: 'Sim', style: 'destructive',
                                onPress: () => {
                                    db.transaction((tx) => {
                                        tx.executeSql("delete from viagem where id = (?)", [data.item.id]);
                                    });
                                    closeRow(rowMap, data.item.id);
                                    setUpdate(true);
                                }
                            }
                        ]
                    );
                }}
            >
                <Image
                    source={require('./tash.png')}
                    style={{ width: 40, height: 40 }}
                />
            </TouchableOpacity>

        )
    }

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const onRefresh = () => {
        autenticar()
    };

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
                    <TouchableOpacity
                        disabled={!autenticado}
                        activeOpacity={0.7}
                        onPress={() => navigation.push("cadastroviagem")}
                        style={styles.touchableOpacityStyle}>
                        <Image
                            source={{
                                uri:
                                    'https://developerplus.com.br/wp-content/uploads/2021/12/plus_icon.png',
                            }}
                            style={styles.floatingButtonStyle}
                        />
                    </TouchableOpacity>
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
        height: 60,               
    },    
    titleStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
    },
    textStyle: {
        fontSize: 16,
        padding: 5,
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
        borderBottomWidth: 0,
        justifyContent: 'center',
        height: 60,
        paddingLeft: 20
    },
    baseText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    innerText: {
        color: 'red',
    },
});