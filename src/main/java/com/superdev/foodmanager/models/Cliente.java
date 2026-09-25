package com.superdev.foodmanager.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 60, nullable = false, unique = true)
    private String nome;

    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @Column(length = 20, nullable = false, unique = true)
    private String telefone;

    @Column(length = 25)
    private String cpf;

    @Column(length = 255)
    private String endereco;

    @Column(nullable = false)
    private boolean ativo;

    @Column(name = "data_cadastro")
    private LocalDate dataCadastro;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void aoCriar(){
        if(criadoEm == null)
            criadoEm = LocalDateTime.now();
        if(dataCadastro == null)
            dataCadastro = LocalDate.now();
    }
}