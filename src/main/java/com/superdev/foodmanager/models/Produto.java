package com.superdev.foodmanager.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 60, nullable = false, unique = true)
    private String nome;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal preco;

    @Column(length = 255)
    private String descricao;

    @Column(nullable = false)
    private Integer tempo_preparo;
}