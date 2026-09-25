package com.superdev.foodmanager.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome_cliente", length = 100, nullable = false)
    private String nomeCliente;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "valor_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "forma_pagamento", nullable = false, length = 30)
    private String formaPagamento;

    @Column(length = 255)
    private String observacao;

    @Column(name = "tipo_pedido", nullable = false, length = 30)
    private String tipoPedido;

    @Column(name = "tempo_estimado")
    private Integer tempoEstimado;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void aoCriar() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
        if (status == null) status = "PENDENTE";
    }
}