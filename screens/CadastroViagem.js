import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { useRoute } from '@react-navigation/native';
import * as yup from "yup";

const db = SQLite.openDatabase("cadviagem.db");

export default function CadastroViagem({ navigation }) {
    const [nome, setNome] = useState('');
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [total, setTotal] = useState(0);

    async function handleSendForm() {
        try {
            const schema = yup.object().shape({
                nome: yup.string().required("Por favor, informe a Viagem."),
                inicio : yup.string().required("Por favor, informe a Data de inicio."), 
            })

            await schema.validate({ nome, inicio })

            addViagem();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                Alert.alert(error.message)
            }
        }
    }

    const updateTotal = () => {
        db.transaction((tx) => {
            tx.executeSql("select count(id) as total from cadviagem", [], (_, { rows }) =>
                setTotal(rows._array[0].total));
        })
    }

    const addViagem = () => {
        db.transaction((tx) => {
            tx.executeSql("insert into cadviagem (nome,inicio,fim) values (?,?,?)", [nome, inicio, fim]);
        });
        updateTotal();
        navigation.navigate("home", { atualizar: true });
    }

    // <TextInput placeholder="Viagem" style={styles.textInput} onChangeText={text => setNome(text)} />
    //<TextInput placeholder="Viagem" keyboardType="default" onChangeText={onChange} value={value} style={estilosAdd.input} />

    // <TextInput placeholder="Viagem" style={styles.textInput} onChangeText={text => setNome(text)} />
    return (
        <View style={styles.container}>
            <TextInput placeholder="Viagem" style={styles.textInput} onChangeText={text => setNome(text)} />
            <TextInput placeholder="Inicio" style={styles.textInput} onChangeText={text => setInicio(text)} />
            <TextInput placeholder="Fim" style={styles.textInput} onChangeText={text => setFim(text)} />
            <StatusBar style="auto" />
            <TouchableOpacity style={styles.btnCadastro} onPress={handleSendForm}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Cadastrar
                </Text>
            </TouchableOpacity>
        </View >
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
    estilosAdd: {
        input: {
            borderWidth: 1,
            borderColor: "#ccc",
            width: 300,
            padding: 10
        },
        error: {
            color: "crimson"
        }
    },
});