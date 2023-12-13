import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as yup from "yup";

const db = SQLite.openDatabase("cadviagem.db");

export default function EditarViagem({ navigation, route }) {
    const [nome, setNome] = useState('');
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');

    useEffect(() => {
        if (route.params?.id !== null) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM CADVIAGEM WHERE ID = (?)', [route.params?.id], (_, { rows }) => {
                        setNome(rows._array[0].nome),
                            setInicio(rows._array[0].inicio),
                            setFim(rows._array[0].fim)
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
                inicio: yup.string().required("Por favor, informe uma Data."),
            })

            await schema.validate({ nome, inicio })

            updateViagem();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                Alert.alert(error.message)
            }
        }
    }

    const updateViagem = () => {
        db.transaction((tx) => {
            tx.executeSql("update cadviagem set nome = (?), inicio = (?), fim = (?) where id = (?)", [nome, inicio, fim, route.params?.id], (tx, results) => {
                if (results.rows._array.length > 0) {
                    alert('ERROR.')
                }
                else {

                }
            });
            navigation.navigate("home", { atualizar: true });
        })
    }

    return (
        <View style={styles.container}>
            <TextInput value={nome} placeholder="Viagem" style={styles.textInput} onChangeText={text => setNome(text)} />
            <TextInput value={inicio} placeholder="Inicio" style={styles.textInput} onChangeText={text => setInicio(text)} />
            <TextInput value={fim} placeholder="Fim" style={styles.textInput} onChangeText={text => setFim(text)} />
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