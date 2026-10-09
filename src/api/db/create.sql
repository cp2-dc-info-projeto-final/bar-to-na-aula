DROP TABLE IF EXISTS item_carrinho;
DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS mesa;
DROP TABLE IF EXISTS shows;
-- (usuario, bebida, comida: mantenha como estão)

CREATE TABLE shows (
    id bigint GENERATED ALWAYS AS IDENTITY,
    artista text NOT NULL,
    horario TIME NOT NULL,
    genero text NOT NULL,
    CONSTRAINT pk_shows PRIMARY KEY (id)
);

CREATE TABLE mesa (
    id bigint GENERATED ALWAYS AS IDENTITY,
    identificacao INTEGER NOT NULL,
    tipo text NOT NULL DEFAULT 'sem_show',
    m.id_show bigint,
    CONSTRAINT pk_mesa PRIMARY KEY (id),
    CONSTRAINT uk_mesa_identificacao UNIQUE (identificacao),
    CONSTRAINT ck_mesa_tipo CHECK (tipo IN ('sem_show', 'com_show')),
    CONSTRAINT fk_mesa_show FOREIGN KEY (id_show) REFERENCES shows(id) ON DELETE RESTRICT,
    -- com_show exige show; sem_show não pode ter show
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