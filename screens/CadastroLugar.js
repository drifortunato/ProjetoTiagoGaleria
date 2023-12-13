import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as yup from "yup";
import { useRoute } from '@react-navigation/native';

const db = SQLite.openDatabase("local.db");

export default function CadastroLugar({ navigation, route }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [date, setDate] = useState('');
    const [total, setTotal] = useState(0);
    const [idviagem, setIdviagem] = useState(0);

    const updateTotal = () => {
        db.transaction((tx) => {
            tx.executeSql("select count(id) as total from local", [], (_, { rows }) =>
                setTotal(rows._array[0].total));
        })
    }

    async function handleSendForm() {
        try {
            const schema = yup.object().shape({
                nome: yup.string().required("Por favor, informe o Local."),
                descricao : yup.string().required("Por favor, informe uma Descrição."), 
                date : yup.string().required("Por favor, informe uma Data."), 
            })

            await schema.validate({ nome, descricao, date })

            addLugar();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                Alert.alert(error.message)
            }
        }
    }    

    useEffect(() => {
        setIdviagem(route.params?.idV);
    }, [idviagem]);

    const addLugar = () => {
        db.transaction((tx) => {
            tx.executeSql("insert into local (nome,descricao,data,idviagem) values (?,?,?,?)", [nome, descricao, date,idviagem], (tx, results) => {
                if (results.rows._array.length > 0) {
                    alert('ERROR.')
                }
                else {

                }
            });
            updateTotal();
            navigation.navigate("listalugar", { atualizar: true });
        })
    }

    const showAll = () => {
        db.transaction((tx) => {
            tx.executeSql("select nome from local", [], (trans, results) => {
                alert(JSON.stringify(results.rows._array));
            });
        })
    }

    return (
        <View style={styles.container}>
            <TextInput placeholder="Lugar" style={styles.textInput} onChangeText={text => setNome(text)} />
            <TextInput placeholder="Descrição" style={styles.textInput} onChangeText={text => setDescricao(text)} />
            <TextInput placeholder="Data" style={styles.textInput} onChangeText={text => setDate(text)} />
            <StatusBar style="auto" />
            <TouchableOpacity style={styles.btnCadastro} onPress={handleSendForm}>
                <Text style={{ color: 'white', textAlign: 'center' }}>
                    Cadastrar
                </Text>
            </TouchableOpacity>          
        </View >
    );
}
  // <Button title='Exibir todos' onPress={showAll} />
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