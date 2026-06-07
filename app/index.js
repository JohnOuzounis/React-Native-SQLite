import { StyleSheet, Text, View } from 'react-native';
import { Suspense, useEffect, useState } from 'react';
import { DbProvider, useDb } from '../context/DbProvider';
import { connectToDb } from '../db/connectToDb';
import { getModels } from '../utils/models';
import Loader from '../components/loader/Loader';
import { sqlite } from '../db/database';

export default function App() {
    return (
        <View style={styles.container}>
            <Suspense>
                <DbProvider createDatabase={connectToDb} fallback={Loader}>
                    <View style={styles.main}>
                        <Text style={styles.title}>Hello World</Text>
                        <Text style={styles.subtitle}>
                            This is the first page of your app.
                        </Text>
                        <Test />
                    </View>
                </DbProvider>
            </Suspense>
        </View>
    );
}

export function Test() {
    const db = useDb();
    const [version, setVersion] = useState('');

    useEffect(() => {
        async function setup() {
            const result = await db.instance.getFirstAsync(
                'SELECT sqlite_version()',
            );
            setVersion(result['sqlite_version()']);

            const { Order } = getModels();

            const orders = await Order.findAll({
                attributes: [['Orders.id', 'id'], 'orderDate', 'total'],
                unique: 'id',
                include: [
                    {
                        model: 'Customers',
                        unique: 'email',
                        attributes: ['name', 'email'],
                        on: ['customerId', 'id'],
                        as: 'customer',
                    },
                    {
                        model: 'OrderItems',
                        unique: 'itemId',
                        attributes: [
                            ['OrderItems.id', 'itemId'],
                            'quantity',
                            'unitPrice',
                        ],
                        on: ['id', 'orderId'],
                        as: 'items',
                        include: [
                            {
                                model: 'Products',
                                unique: 'productId',
                                attributes: [
                                    ['Products.id', 'productId'],
                                    ['Products.name', 'productName'],
                                    'price',
                                ],
                                on: ['productId', 'id'],
                                as: 'product',
                            },
                        ],
                    },
                ],
            });

            console.log(JSON.stringify(orders, null, 2));
        }
        setup().catch(console.log);
    }, []);

    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerText}>SQLite version: {version}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        maxWidth: 960,
        marginHorizontal: 'auto',
    },
    title: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 36,
        color: '#38434D',
    },
});
