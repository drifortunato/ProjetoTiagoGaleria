import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, StyleSheet, TextInput, TouchableOpacity, View, Alert } from "react-native";
import * as yup from "yup";
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from "react";

const db = SQLite.openDatabase("local.db");

export default function EditScreen({ navigation, route }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [date, setDate] = useState('');

    //<Text>Atualize a entrada com id: {route.params?.id}</Text>

    useEffect(() => {
        if (route.params?.id !== null) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM local WHERE ID = (?)', [route.params?.id], (_, { rows }) => {
                        setNome(rows._array[0].nome),
                        setDescricao(rows._array[0].descricao),
                        setDate(rows._array[0].data)
                    });
            });
        } else {
            navigation.goBack();
        }
    }, [route]);

    async function handleSendForm() {
        try {
            const schema = yup.object().shape({
                nome: yup.string().required("Por favor, informe o Local."),
                descricao: yup.string().required("Por favor, informe uma Descrição."),
                date: yup.string().required("Por favor, informe uma Data."),
            })

            await schema.validate({ nome, descricao, date })

            updateLugar();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                Alert.alert(error.message)
            }
        }
    }

    const updateLugar = () => {
        db.transaction((tx) => {
            tx.executeSql("update local set nome = (?), descricao = (?), data = (?) where id = (?)", [nome, descricao, date,route.params?.id], (tx, results) => {
                if (results.rows._array.length > 0) {
                    alert('ERROR.')
                }
                else {

                }
            });
            navigation.navigate("listalugar", { atualizar: true });
        })
    }    

    return (
        <View style={styles.container}>
            <TextInput value={nome} placeholder="Lugar" style={styles.textInput} onChangeText={text => setNome(text)} />
            <TextInput value={descricao} placeholder="Descrição" style={styles.textInput} onChangeText={text => setDescricao(text)} />
            <TextInput value={date} placeholder="Data" style={styles.textInput} onChangeText={text => setDate(text)} />
            <StatusBar style="auto" />
            <TouchableOpacity style={styles.btnCadastro} onPress={handleSendForm}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Atualizar
                </Text>
            </TouchableOpacity>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2728D',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    textInput: {
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingLeft: 10,
        marginBottom: 10
    },
    btnCadastro: {
        width: '100%',
        height: 40,
        backgroundColor: '#7b42f5',
        borderRadius: 20,
        justifyContent: 'center'
    },
});