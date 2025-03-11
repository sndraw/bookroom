const neo4j = require('neo4j-driver');
import databaseConf from "../config/neo4j.conf";

const driver = neo4j.driver(databaseConf?.host, neo4j.auth.basic(databaseConf?.user, databaseConf?.password));

export default driver;