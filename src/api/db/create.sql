DROP TABLE IF EXISTS item_carrinho;
DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS mesa;
DROP TABLE IF EXISTS shows;

DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id bigint GENERATED ALWAYS AS IDENTITY,
    login text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    
    -- Constraints
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_login UNIQUE (login), -- unicidade
    CONSTRAINT uk_usuario_email UNIQUE (email), -- unicidade
    CONSTRAINT ck_usuario_login_length CHECK (length(login) >= 3 AND length(login) <= 50), -- comprimento
    CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    CONSTRAINT ck_usuario_role_valid CHECK (role IN ('admin', 'user')) -- tipos de usuário 
);

DROP TABLE IF EXISTS bebida;

CREATE TABLE bebida (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text not null,
    preco text not null,  -- troquei temporariamente por string, mas é number(integer)
    marca text not null,
    tamanho text not null ,
    tipo text NOT NULL DEFAULT 'alcolico',

    -- Constraints

    CONSTRAINT pk_bebida PRIMARY KEY (id),
    CONSTRAINT ck_bebida_tipo CHECK (tipo IN ('alcolico', 'nao alcolico'))
);

DROP TABLE IF EXISTS comida;

CREATE TABLE comida (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text not null,
    preco TEXT not NULL,
    sabor text NOT NULL DEFAULT 'salgado',

    CONSTRAINT pk_comida PRIMARY KEY (id),
    CONSTRAINT ck_comida_sabor CHECK (sabor IN ('salgado', 'doce'))
);



DROP TABLE IF EXISTS shows;
CREATE TABLE shows (
    id bigint GENERATED ALWAYS AS IDENTITY,
    artista text NOT NULL,
    horario TIME NOT NULL,
    genero text NOT NULL,
    CONSTRAINT pk_shows PRIMARY KEY (id),
    CONSTRAINT uk_shows_artista_horario UNIQUE (artista, horario)
);

DROP TABLE IF EXISTS mesa;
CREATE TABLE mesa (
    id bigint GENERATED ALWAYS AS IDENTITY,
    identificacao INTEGER NOT NULL,
    tipo text NOT NULL DEFAULT 'sem_show',
    id_show bigint,
    CONSTRAINT pk_mesa PRIMARY KEY (id),
    CONSTRAINT uk_mesa_identificacao UNIQUE (identificacao),
    CONSTRAINT ck_mesa_tipo CHECK (tipo IN ('sem_show', 'com_show')),
    CONSTRAINT fk_mesa_show FOREIGN KEY (id_show) REFERENCES shows(id) ON DELETE RESTRICT,
    CONSTRAINT ck_mesa_show CHECK (
        (tipo = 'com_show' AND id_show IS NOT NULL) OR
        (tipo = 'sem_show' AND id_show IS NULL)
    )
);

CREATE TABLE compra (
    id bigint GENERATED ALWAYS AS IDENTITY,
    id_usuario bigint,
    preco_total INTEGER,
    data_hora TIMESTAMP DEFAULT now(),
    CONSTRAINT pk_compra PRIMARY KEY (id),
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE item_carrinho (
    id bigint GENERATED ALWAYS AS IDENTITY,
    quantidade INTEGER,
    id_usuario bigint,
    id_bebida BIGINT,
    id_comida BIGINT,
    id_compra BIGINT,
    CONSTRAINT fk_id_bebida FOREIGN KEY (id_bebida) REFERENCES bebida(id),
    CONSTRAINT fk_id_comida FOREIGN KEY (id_comida) REFERENCES comida(id),
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_id_compra FOREIGN KEY (id_compra) REFERENCES compra(id),
    CONSTRAINT verificacao CHECK (
        (id_bebida IS NOT NULL AND id_comida IS NULL) OR
        (id_bebida IS NULL AND id_comida IS NOT NULL)
    )
);

INSERT INTO shows (artista, horario, genero) 
VALUES ('Banda Teste', '21:00', 'Rock');

INSERT INTO mesa (identificacao, tipo, id_show) 
VALUES (1, 'com_show', 1), (2, 'sem_show', NULL);