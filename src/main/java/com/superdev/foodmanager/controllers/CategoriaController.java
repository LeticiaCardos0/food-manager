package com.superdev.foodmanager.controllers;

import com.superdev.foodmanager.dtos.categoria.CategoriaAtualizarDto;
import com.superdev.foodmanager.dtos.categoria.CategoriaCriarDto;
import com.superdev.foodmanager.models.Categoria;
import com.superdev.foodmanager.services.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")

public class CategoriaController {
    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Categoria> listar(){
        return service.listar();
    }

    @PostMapping
    public Categoria criar(@RequestBody @Valid CategoriaCriarDto dto){
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public Categoria atualizar(@PathVariable int id,
        @RequestBody @Valid CategoriaAtualizarDto dto){
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public Categoria apagar(@PathVariable int id){
        return service.apagar(id);
    }

    @GetMapping("/{id}")
    public Categoria obterPorId(@PathVariable int id){
        return service.obterPorId(id);
    }

}
