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
    preço INTEGER,
    marca text not null,
    tamanho text not null DEFAULT 'pequeno',
    tipo text NOT NULL DEFAULT 'alcolico',

    -- Constraints

    CONSTRAINT ck_bebida_tamanho CHECK (tamanho IN ('pequeno', 'medio', 'grande')),
    CONSTRAINT pk_bebida PRIMARY KEY (id),
    CONSTRAINT ck_bebida_tipo CHECK (tipo IN ('alcolico', 'nao alcolico'))
);

DROP TABLE IF EXISTS comida;

CREATE TABLE comida (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text not null,
    preço INTEGER,
    sabor text NOT NULL DEFAULT 'salgado',


    CONSTRAINT pk_comida PRIMARY KEY (id),
    CONSTRAINT ck_comida_tipo CHECK (sabor IN ('salgado', 'doce'))
);

DROP TABLE IF EXISTS shows;

CREATE TABLE shows(
    id bigint GENERATED ALWAYS AS IDENTITY,
    artista text not NULL,
    horario INTEGER,
    genero text not NULL,

    CONSTRAINT pk_shows PRIMARY KEY (id),
);

DROP TABLE IF EXISTS mesa;

CREATE TABLE mesa(
    id bigint GENERATED ALWAYS AS IDENTITY,
    horario INTEGER,
    tipo text NOT NULL DEFAULT 's/show',

    CONSTRAINT pk_mesa PRIMARY KEY (id),
    CONSTRAINT ck_mesa_tipo CHECK (tipo IN ('s/show', 'c/show'))
);


INSERT INTO usuario (login, email, senha, role) VALUES
-- senha efelantinho
('hermenegildo', 'hermenegildo@email.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin');


