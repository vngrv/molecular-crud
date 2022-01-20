"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt   = require("bcrypt");
const jwt    = require("jsonwebtoken");
const DbService = require("../mixins/db.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "users",
    
	mixins: [
		DbService("users")
	],

	/**
	 * Settings
	 */
	settings: {
		/** Secret for JWT */
		JWT_SECRET: process.env.JWT_SECRET || "jwt-secret",
		/** Public fields */
		fields: ["_id", "firstname", "lastname", "email", "bio", "image"],
		/** Validator schema for entity */
		entityValidator: {
			firstname: { type: "string",  optional: true},
			lastname: { type: "string", optional: true},
			email: { type: "email" ,  optional: true},
			password: { type: "string", min: 6 },
			bio: { type: "string", optional: true },
			image: { type: "string", optional: true },
		}

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler() {
				return "Hello Moleculer";
			}
		},

		/**
		 * Welcome, a username
		 *
		 * @param {String} name - User name
		 */
		welcome: {
			rest: "/welcome",
			params: {
				name: "string"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
			}
		},
		/**
         * Register a new user
         *
         * @actions
         * @param {Object} user - User entity
         *
         * @returns {Object} Created entity & token
         */
		create: {
			params: { 
                firstname: { type: "string"},
			    lastname: { type: "string"},
			    email: { type: "email" },
			    password: { type: "string", min: 6 }
            },
			async handler(ctx) {
				let entity = ctx.params;
				await this.validateEntity(entity);
				if (entity.email) {
					const found = await this.adapter.findOne({ email: entity.email });
					if (found)
						return Promise.reject(
							new MoleculerClientError("Email exists!", 422, "Email exists!", [{ field: "email", message: "Email exists"}])
						);
				}
				entity.password = bcrypt.hashSync(entity.password, 10);
				entity.bio = entity.bio || "";
				entity.image = entity.image || null;
				entity.createdAt = new Date();

				const doc = await this.adapter.insert(entity);
				const user = await this.transformDocuments(ctx, {}, doc);
				return this.entityChanged("created", user, ctx).then(() => user);
			}
		},
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
