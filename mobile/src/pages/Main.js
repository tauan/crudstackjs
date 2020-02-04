import React, { useState, useEffect } from 'react'
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { MaterialIcons } from '@expo/vector-icons'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import socket, { connect, disconnect, subscribeToNewDev } from '../services/socket'

import api  from '../services/api'

function Main({ navigation }) {
    const [devs, setDevs] = useState([])
    const [currentRegion, setCurrentRegion] = useState(null)
    const [techs, setTechs] = useState('')   

    function setupWebSocket() {
        disconnect()
        const { latitude, longitude } = currentRegion
        connect(
            latitude,
            longitude,
            techs
        )
    }
    
    useEffect(()=>{
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync()
            
            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                })

                const { latitude, longitude } = coords

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                })
            }
        }
        loadInitialPosition()
    }, [])
    useEffect(() => {
        subscribeToNewDev(dev=> setDevs([...devs, dev]))
    }, [devs])

    async function loadDevs() {
        Keyboard.dismiss()
        const { latitude, longitude } = currentRegion
        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        })

        setDevs(response.data.devs)
        setupWebSocket()

    }

    function handleRegionChanged (region) {
        console.log(region)
        setCurrentRegion(region)    
    }

    if(!currentRegion) {
        return null
    }

    return(<>
        <MapView onRegionChangeComplete={handleRegionChanged} initialRegion={currentRegion} style={styles.map}>
            {
                devs.map(dev=> (
                    <Marker key={dev._id} coordinate={{
                        latitude: dev.location.coordinates[1],
                        longitude: dev.location.coordinates[0]
                    }}>
                        <Image style={styles.iconMap} source={{ uri: dev.avatar_url}} />
                        <Callout onPress={()=>{
                            navigation.navigate('Profile', { github_username: dev.github_username })
                        }}>
                            <View style={styles.callout}>
                                <Text style={styles.devName}>{dev.name?dev.name : dev.github_username}</Text>
                    <Text style={styles.devBio}>{dev.bio?dev.bio:'Usuario não possui Bio'}</Text>
                    <Text style={styles.devTechs}>{dev.techs.join(", ")}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))
            }
        </MapView>
        <View style={styles.searchForm}>
            <TextInput 
                style={styles.searchInput} 
                placeholder="Buscar por techs"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                value={techs}
                onChangeText={setTechs}
            />
            <TouchableOpacity style={styles.loadButton} onPress={loadDevs} >
                <MaterialIcons name="my-location" size={20} color="#fff" />
            </TouchableOpacity>
        </View></>
    )
}

const myPosition = {
    latitude: -23.0883592,
    longitude: -52.4572162
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    iconMap: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#fff'
    },
    callout: {
        width: 260,
        padding: 5,
        borderRadius: 10,
    },
    devName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    devBio: {
        color: '#666',
        marginTop: 5
    },
    devTechs: {
        marginTop: 5
    },
    
    searchForm: {
        position: "absolute",

        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: "#333",
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 5

    },
    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: "#8e4dff",
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15 
    }
})


export default Main